'use strict';

const apollo = require('node-apollo');

// 携程apollo配置中心配置
const apollo_config = {
  configServerUrl: 'http://127.0.0.1:8070',   
  appId: 'SampleApp',
  clusterName: 'default',
  apolloEnv: 'dev',
  //namespaceName: 'TEST1.hw',
  token: '5c0c3672115e9d245d8e70dc89406a0c120c9f45'
};

let db = null;
const sleeptime = 200; 

console.log('=================== NodeJS Client ===================');
console.log('Please enter key to query!');





function sleep() {
    return new Promise(resolve => { 
        setTimeout(() => { resolve('') }, sleeptime); 
    })
}

const readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const isDiff = (oldObj, newObj) => {
  let oldKeys = Object.keys(oldObj);
  let newKeys = Object.keys(newObj);
  if(oldKeys.length != newKeys.length)
    return true;
  
  let result = oldKeys.find(key=>{
    return JSON.stringify(oldObj[key]) != JSON.stringify(newObj[key]);
  });
  if(result)
    return true;
  
  return false;
}

const getPrompMsg = (oldObj, newObj) => {
  let oldKeys = Object.keys(oldObj);
  let newKeys = Object.keys(newObj);

  if(oldKeys.length === newKeys.length){ //modify
    let key = oldKeys.find(key=>{
      return JSON.stringify(oldObj[key]) != JSON.stringify(newObj[key]);
    });
    if(key){
      return `Change - key: ${key}, oldValue: ${JSON.stringify(oldObj[key])}, newValue: ${JSON.stringify(newObj[key])} \n`;
    }else{
      console.error('Exception');
    }
  }else if(oldKeys.length < newKeys.length){ //add
    let newKey = newKeys.find(newKey=>{
      return oldKeys.indexOf(newKey) === -1;
    })
    return `New - key: ${newKey}, value: ${JSON.stringify(newObj[newKey])} \n`;
  }else if(oldKeys.length > newKeys.length){ //delete
    let oldKey = oldKeys.find(oldKey=>{
      return newKeys.indexOf(oldKey) === -1;
    })
    return `Delete - key: ${oldKey}, value: ${JSON.stringify(oldObj[oldKey])} \n`;
  }
}

const longpulling = ()=>{
  apollo.remoteConfigService(apollo_config)
  .then((async (bundle) => {
    if(!db)
     db = bundle;

    if(isDiff(db, bundle)){
      let msg = getPrompMsg(db, bundle);
      rl.setPrompt(msg);
      rl.prompt();
    }
    
    db = bundle;
    await sleep();
    longpulling();
  }))
  .catch(async (err) => {
    console.error(err);
    await sleep();
    longpulling();
  }).done;
}



longpulling();




rl.on('line', (line) => {
  let value = db[line];
  if(value){
    console.log(`Loading key: ${line} with value: ${value} \n`);
  }
}).on('close', () => {
  process.exit(0);
});




 
 