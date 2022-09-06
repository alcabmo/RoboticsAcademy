import json
import rospy
import cv2
import sys
import base64
import threading
import time
import numpy as np
from datetime import datetime
from websocket_server import WebsocketServer
import multiprocessing
import logging

from interfaces.pose3d import ListenerPose3d
from shared.image import SharedImage
from shared.value import SharedValue
from shared.mouse import Mouse

# Graphical User Interface Class
class GUI:
    # Initialization function
    # The actual initialization
    def __init__(self, host):
        rospy.init_node("GUI_guest")

        self.payload = {'image_guest': ''}
        self.left_payload = {'image_guest': ''}
        self.server = None
        self.client = None
        
        self.host = host
        
        # Image variable guest
        self.shared_image_guest = SharedImage("guifrontalimageguest")
        self.shared_left_image_guest = SharedImage("guiventralimageguest")
        
        # Event objects for multiprocessing
        self.ack_event = multiprocessing.Event()
        self.cli_event = multiprocessing.Event()

        self.mouse = Mouse()
        # Start server thread
        t = threading.Thread(target=self.run_server)
        t.start()
        
    def payloadImage(self):
        image = self.shared_image_guest.get()
        payload = {'image_guest': '', 'shape_guest': ''}
    	
        shape = image.shape
        frame = cv2.imencode('.JPEG', image)[1]
        encoded_image = base64.b64encode(frame)
        
        payload['image_guest'] = encoded_image.decode('utf-8')
        payload['shape_guest'] = shape
        
        return payload
    
    # Function to prepare image payload
    # Encodes the image as a JSON string and sends through the WS
    def payloadLeftImage(self):
        image = self.shared_left_image_guest.get()
        payload = {'image_guest': '', 'shape_guest': ''}

        shape = image.shape
        frame = cv2.imencode('.JPEG', image)[1]
        encoded_image = base64.b64encode(frame)

        payload['image_guest'] = encoded_image.decode('utf-8')
        payload['shape_guest'] = shape

        return payload

    # Function to get the client
    # Called when a new client is received
    def get_client(self, client, server):
        self.client = client
        self.cli_event.set()

        print(client, 'connected')
        
    # Update the gui
    def update_gui(self):
        # Payload Image Guest
        payload_guest = self.payloadImage()
        self.payload["image_guest"] = json.dumps(payload_guest)

        message = "#gui" + json.dumps(self.payload)
        self.server.send_message(self.client, message)

        # Payload Left Image Message
        left_payload_guest = self.payloadLeftImage()
        self.left_payload["image_guest"] = json.dumps(left_payload_guest)

        message = "#gul" + json.dumps(self.left_payload)
        self.server.send_message(self.client, message)
            
    # Function to read the message from websocket
    # Gets called when there is an incoming message from the client
    def get_message(self, client, server, message):
        # Acknowledge Message for GUI Thread
        if(message[:4] == "#ack"):
            # Set acknowledgement flag
            self.ack_event.set()
        elif message[:4] == "#mou":
            self.mouse.start_mouse(int(message[4:5]))
        elif message[:4] == "#stp":
            self.mouse.stop_mouse()
        elif message[:4] == "#rst":
            self.mouse.reset_mouse()
        # Reset message
        elif(message[:5] == "#rest"):
            self.reset_gui()
    # Function that gets called when the connected closes
    def handle_close(self, client, server):
        print(client, 'closed')

    # Activate the server
    def run_server(self):
        self.server = WebsocketServer(port=2304, host=self.host)
        self.server.set_fn_new_client(self.get_client)
        self.server.set_fn_message_received(self.get_message)
        self.server.set_fn_client_left(self.handle_close)

        logged = False
        while not logged:
            try:
                f = open("/ws_gui_guest.log", "w")
                f.write("websocket_gui_guest=ready")
                f.close()
                logged = True
            except:
                time.sleep(0.1)

        self.server.run_forever()

    # Function to reset
    def reset_gui(self):
        pass
        

# This class decouples the user thread
# and the GUI update thread
class ProcessGUI(multiprocessing.Process):
    def __init__(self):
        super(ProcessGUI, self).__init__()

        self.host = sys.argv[1]
        # Time variables
        self.time_cycle = SharedValue("gui_time_cycle")
        self.ideal_cycle = SharedValue("gui_ideal_cycle")
        self.iteration_counter = 0

    # Function to initialize events
    def initialize_events(self):
        # Events
        self.ack_event = self.gui.ack_event
        self.cli_event = self.gui.cli_event
        self.exit_signal = multiprocessing.Event()

    # Function to start the execution of threads
    def run(self):
        # Initialize GUI
        self.gui = GUI(self.host)
        self.initialize_events()

        # Wait for client before starting
        self.cli_event.wait()
        self.measure_thread = threading.Thread(target=self.measure_thread)
        self.thread = threading.Thread(target=self.run_gui)

        self.measure_thread.start()
        self.thread.start()

        print("GUI Process Started!")

        self.exit_signal.wait()

    # The measuring thread to measure frequency
    def measure_thread(self):
        previous_time = datetime.now()
        while(True):
            # Sleep for 2 seconds
            time.sleep(2)

            # Measure the current time and subtract from previous time to get real time interval
            current_time = datetime.now()
            dt = current_time - previous_time
            ms = (dt.days * 24 * 60 * 60 + dt.seconds) * 1000 + dt.microseconds / 1000.0
            previous_time = current_time

            # Get the time period
            try:
                # Division by zero
                self.ideal_cycle.add(ms / self.iteration_counter)
            except:
                self.ideal_cycle.add(0)

            # Reset the counter
            self.iteration_counter = 0

    # The main thread of execution
    def run_gui(self):
        while(True):
            start_time = datetime.now()
            # Send update signal
            self.gui.update_gui()

            # Wait for acknowldege signal
            self.ack_event.wait()
            self.ack_event.clear()
            
            finish_time = datetime.now()
            self.iteration_counter = self.iteration_counter + 1
            
            dt = finish_time - start_time
            ms = (dt.days * 24 * 60 * 60 + dt.seconds) * 1000 + dt.microseconds / 1000.0
            time_cycle = self.time_cycle.get()

            if(ms < time_cycle):
                time.sleep((time_cycle-ms) / 1000.0)

        self.exit_signal.set()

    # Functions to handle auxillary GUI functions
    def reset_gui(self):
        self.gui.reset_gui()

if __name__ == "__main__":
    gui = ProcessGUI()
    gui.start()
