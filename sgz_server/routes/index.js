var express = require('express');
var path = require('path'); //系统路径模块
var fs = require('fs'); //
var router = express.Router();

function UserInfo(id, code, mac,day) {
  this.id = id;
  this.code = code;
  this.mac = mac;
  this.day = day;
  this.showInfo = function () {
  };
  // console.log("UserInfo()");
}
function  makeCode() {
  var str = "";
  for(var i = 0;i<5;i++){
  var dig = String.fromCharCode(Math.floor(Math.random()*26+"A".charCodeAt(0)));
  var num = Math.floor(Math.random()*100);
    str += dig;
    str += num;
    // console.log("make code() :"+str);
  }
  return str;
}

/**************************************************新增json****************************************************/
function writeJson(params){
  //现将json文件读出来

  fs.readFile('./mock/person.json',function(err,data){
    if(err){
      return console.error(err);
    }

    var person = data.toString();//将二进制的数据转换为字符串
    person = JSON.parse(person);//将字符串转换为json对象
    for(var i = 0;i<params.length;i++){
    person.data.push(params[i]);//将传来的对象push进数组对象中
    }
    person.total = person.data.length;//定义一下总条数，为以后的分页打基础
    // console.log(person.data);
    var str = JSON.stringify(person);//因为nodejs的写入文件只认识字符串或者二进制数，所以把json对象转换成字符串重新写入json文件中
    fs.writeFile('./mock/person.json',str,function(err){
      if(err){
        console.error(err);
      }
      console.log('----------新增成功-------------');
    })
  })
}
/**************************************************新增json****************************************************/
function deleteJson(id){
  fs.readFile('./mock/person.json',function(err,data){
    if(err){
      return console.error(err);
    }
    var person = data.toString();
    person = JSON.parse(person);
    //把数据读出来删除
    for(var i = 0; i < person.data.length;i++){
      if(id == person.data[i].id){
        //console.log(person.data[i])
        person.data.splice(i,1);
      }
    }
    console.log(person.data);
    person.total = person.data.length;
    var str = JSON.stringify(person);
    //然后再把数据写进去
    fs.writeFile('./mock/person.json',str,function(err){
      if(err){
        console.error(err);
      }
      console.log("----------删除成功------------");
    })
  })
}

/**************************************************修改json****************************************************/
function insertMac_Day(index,mac,day){
  var data = fs.readFileSync('./mock/person.json');
  var person = data.toString();
  person = JSON.parse(person);
  person.data[index].mac= mac;
  person.data[index].day= day;
  var str = JSON.stringify(person);//因为nodejs的写入文件只认识字符串或者二进制数，所以把json对象转换成字符串重新写入json文件中
  fs.writeFileSync('./mock/person.json',str);
  console.log('------------------------insert success');
}
/**************************************************查询json****************************************************/
function pagination(code){
  //p为页数，比如第一页传0，第二页传1,s为每页多少条数据
  var data = fs.readFileSync('./mock/person.json');
  var person = data.toString();
  person = JSON.parse(person);
  //把数据读出来
  //console.log(person.data);
  var length = person.data.length;
  var index = parseInt(code);
  var pagePerson = person.data[index];
  console.log('------------------------query success');
  // console.log(pagePerson);
  return pagePerson;
}

var CODE_NOT_TRUE ="激活码不正确";
var CODE_TRUE ="激活码正确";
var CODE_OVER_TIME ="激活码已到期,请重新购买";
var CODE_REGISTER_SUCCESS ="激活码激活成功";

function addData(){
  var users = [];
  for(var i=0;i<1000;i++){
    var user = new UserInfo(i,i+""+makeCode(),"",15);
    users[i]=user;
  }
  writeJson(users);
}
Date.prototype.format = function(fmt)
{ //author: meizz
  var o = {
    "M+" : this.getMonth()+1,                 //月份
    "d+" : this.getDate(),                    //日
    "h+" : this.getHours(),                   //小时
    "m+" : this.getMinutes(),                 //分
    "s+" : this.getSeconds(),                 //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S"  : this.getMilliseconds()             //毫秒
  };
  if(/(y+)/.test(fmt))
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)
    if(new RegExp("("+ k +")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
  return fmt;
}
//相差时间天数
function dateDiff(sDate2) {
  var sDate1=new Date().format("yyyy-MM-dd");
  // console.log("sDate1 :"+ sDate1);
  // console.log("sDate2 :"+ sDate2);
  var aDate, oDate1, oDate2, iDays;
  aDate = sDate1.split("-");
  oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);  //转换为yyyy-MM-dd格式
  aDate = sDate2.split("-");
  oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);
  iDays = parseInt((oDate2 - oDate1) / 1000 / 60 / 60 / 24); //把相差的毫秒数转换为天数
  return iDays;  //返回相差天数
}

var ONE_SECOND = 1000;
var ONE_DAY = ONE_SECOND*60*60*24;

function UserRegisterCode(code,mac){
  var resInfo = pagination(code);
   var flag = -1;
    var day = -1;
  if(resInfo !=undefined){ //激活码不正确
    console.log(resInfo);
    if(resInfo.code ===code && resInfo.mac ===""){
      // console.log(CODE_REGISTER_SUCCESS);
      reason = CODE_REGISTER_SUCCESS;
      var time = new Date();
      day = resInfo.day;
      time.setTime(time.getTime()+ONE_DAY*day);
      time = time.format("yyyy-MM-dd");
      insertMac_Day(parseInt(code),mac,time);
      flag = 2;
      //修改数据，插入mac
    }else if(resInfo.code ===code && resInfo.mac === mac){
      // console.log(CODE_TRUE);
      reason = CODE_TRUE;
      // console.log(resInfo);
      var surplusday = dateDiff(resInfo.day);
      flag = 1;
      if(surplusday < 0){
        // console.log(CODE_OVER_TIME);
        reason = CODE_OVER_TIME;
        flag = -1;
      }
      day = surplusday;
    }else {
      // console.log(CODE_NOT_TRUE);
      // console.log(resInfo);
      reason = CODE_NOT_TRUE;
      flag = -1;
    }

  }else{
    // console.log(CODE_NOT_TRUE);
    reason = CODE_NOT_TRUE;
    flag = -1;
  }
var resobj = {};
  resobj.flag = flag;
  resobj.reason = reason;
  resobj.day = day;
  return resobj;
}
/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("==============================================================");

  // addData();
  codevalue = req.param("code");
  console.log(codevalue);
  macvalue = req.param("mac");
  console.log(macvalue);

  var resobj = UserRegisterCode(codevalue,macvalue);

  // res.render('index', { title: 'Express' });
  //   res.write("abc");
  // res.send("");
  res.json(resobj);
  console.log("==============================================================");
});

module.exports = router;
