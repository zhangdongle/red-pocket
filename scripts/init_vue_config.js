var fs = require('fs');
function convertToMap(content){
  let lines = content.split('\n');
  let map = {};
  for(var i in lines){
    var item = lines[i].split("=");
    // console.log(item);
    var key = item[0]?item[0].replace(/\s+/g,""):'';
    var value = item[1]?item[1].replace(/\s+/g,""):'';
    if(key){
      map[key] = value;
    }    
  }
  // console.log("所有存在配置", map);
  return map;
}
function convertToLine(map){
  var strs = "";
  for(var key in map){
    strs += key;
    strs += "=";
    strs += map[key];
    strs += "\n";
  }
  return strs;
}

function run(env,tokenMode,redpocketAddress,tokenAddress){
  let path = './app/redpocket/.env.'+env;
  let configPath = path;
  var options = {}
  try{
    fs.accessSync(configPath, '配置不存在' | '文件存在，可以进行读写');
    var data = fs.readFileSync(path,'utf-8');
    options = convertToMap(data);
  }catch(e){
    console.log("文件不存在",e);
  }
  
  if(tokenMode){
    options['VUE_APP_TOKEN_MODE'] =  tokenMode;
  }
  if(redpocketAddress){
    options['VUE_APP_REDPOCKET_ADDRESS'] =  redpocketAddress;
  }
  if(tokenAddress){
    options['VUE_APP_TOKEN_ADDRESS'] =  tokenAddress;
  }
  // console.log("写入配置文件内容前：", options);
  var cmdStr = convertToLine(options);
  // console.log("写入配置文件内容：", cmdStr);
  fs.writeFile(configPath, cmdStr ,err=>{
    if(err){
      console.log("写入失败！", err);
    }
  });
}
module.exports = {
  run : run
}