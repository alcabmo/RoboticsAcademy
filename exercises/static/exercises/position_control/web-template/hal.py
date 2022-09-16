import numpy as np
import rospy
import cv2

from drone_wrapper import DroneWrapper
from Beacon import Beacon


# Hardware Abstraction Layer
class HAL:
    IMG_WIDTH = 320
    IMG_HEIGHT = 240
    
    def __init__(self):
        rospy.init_node("HAL")
    
        self.image = None
        self.drone = DroneWrapper(name="rqt")

    # Explicit initialization functions
    # Class method, so user can call it without instantiation
    @classmethod
    def initRobot(cls):
        new_instance = cls()
        return new_instance
    
    # Get Image from ROS Driver Camera
    def get_frontal_image(self):
        image = self.drone.get_frontal_image()
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return image_rgb

    def get_ventral_image(self):
        image = self.drone.get_ventral_image()
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return image_rgb

    def get_position(self):
        pos = self.drone.get_position()
        return pos

    def get_velocity(self):
        vel = self.drone.get_velocity()
        return vel

    def get_yaw_rate(self):
        yaw_rate = self.drone.get_yaw_rate()
        return yaw_rate

    def get_orientation(self):
        orientation = self.drone.get_orientation()
        return orientation

    def get_roll(self):
        roll = self.drone.get_roll()
        return roll

    def get_pitch(self):
        pitch = self.drone.get_pitch()
        return pitch

    def get_yaw(self):
        yaw = self.drone.get_yaw()
        return yaw

    def get_landed_state(self):
        state = self.drone.get_landed_state()
        return state

    def set_cmd_pos(self, x, y, z, az):
        self.drone.set_cmd_pos(x, y, z, az)

    def set_cmd_vel(self, vx, vy, vz, az):
        self.drone.set_cmd_vel(vx, vy, vz, az)

    def set_cmd_mix(self, vx, vy, z, az):
        self.drone.set_cmd_mix(vx, vy, z, az)

    def takeoff(self, h=3):
        self.drone.takeoff(h)

    def land(self):
        self.drone.land()

    def init_beacons(self):
        self.beacons = self.shared_beacons.get(type_name = "list", n_elem = 6)
    
    def get_next_beacon(self):
        for beacon in self.beacons:
            if beacon.is_reached() == False:
                self.shared_beacons.add(np.array([beacon]) ,type_name="list")
      

    def update_hal(self):
        self.get_frontal_image()
        self.get_ventral_image()
        self.get_position()
        self.get_velocity()
        self.get_yaw_rate()
        self.get_orientation()
        self.get_pitch()
        self.get_roll()
        self.get_yaw()
        self.get_landed_state()
        self.set_cmd_pos()
        self.set_cmd_vel()
        self.set_cmd_mix()
        self.init_beacons()
        self.get_next_beacon()


    # Destructor function to close all fds
    def __del__(self):
        self.shared_frontal_image.close()
        self.shared_ventral_image.close()
        self.shared_x.close()
        self.shared_y.close()
        self.shared_z.close()
        self.shared_takeoff_z.close()
        self.shared_az.close()
        self.shared_azt.close()
        self.shared_vx.close()
        self.shared_vy.close()
        self.shared_vz.close()
        self.shared_landed_state.close()
        self.shared_position.close()
        self.shared_velocity.close()
        self.shared_orientation.close()
        self.shared_roll.close()
        self.shared_pitch.close()
        self.shared_yaw.close()
        self.shared_yaw_rate.close()
        self.shared_beacons.close()

class ThreadHAL(threading.Thread):
    def __init__(self, update_function):
        super(ThreadHAL, self).__init__()
        self.time_cycle = 80
        self.update_function = update_function

    def run(self):
        while(True):
            start_time = datetime.now()

            self.update_function()

            finish_time = datetime.now()

            dt = finish_time - start_time
            ms = (dt.days * 24 * 60 * 60 + dt.seconds) * 1000 + dt.microseconds / 1000.0

            if(ms < self.time_cycle):
                time.sleep((self.time_cycle - ms) / 1000.0)
