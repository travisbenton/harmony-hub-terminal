'use strict';

const harmony = require('harmonyhubjs-client');
const HarmonyHubDiscover = require('harmonyhubjs-discover');

const discover = new HarmonyHubDiscover(61991);
const ip = undefined; // <-- replace this variable with the IP address you get after the first time running the file

class HarmonyHub {
  constructor(opt) {
    this.opt = opt;

    if (!ip) {
      console.log(`looking up IP address...`);
      this.findHub();
    }

    this.triggerDevice();
  }

  findHub() {
    discover.on('online', function(hub) {
      console.log(`Successfully found a Harmony Hub IP address: ${hub.ip}. Add the IP address to the undefined "ip" variable in index.js`);
      discover.stop(); 
    });
    discover.start();
  }

  howTo(activities, harmonyClient) {
    console.log(`Possible actions: ${activities.join(', ')}.`);
    harmonyClient.end();
  }

  triggerDevice() {
    harmony(ip).then(harmonyClient => {
      harmonyClient.isOff().then(off => {
        if(off || this.opt === 'help' || this.opt !== 'off') {
          harmonyClient.getActivities().then(activities => {
            let possibleActivities = activities.map(activity => activity.label.toLowerCase());
            
            if (this.opt === 'help') {
              this.howTo(possibleActivities, harmonyClient);
            } else {
              console.log('Turning device on');
              activities.some(activity => {
                if (activity.label.toLowerCase() === this.opt) {
                  const id = activity.id;
                  
                  harmonyClient.startActivity(id);
                  harmonyClient.end();
                  
                  return true;
                }
                return false;
              });
            }
          });
        } else {
          console.log('Turning device off');
          harmonyClient.turnOff();
          harmonyClient.end();
        }
      });
    });
  }
}

new HarmonyHub(process.argv[2]);