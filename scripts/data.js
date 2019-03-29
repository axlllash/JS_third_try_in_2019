var data = (function() {
  var
    data_map, getMap, updateMapWhichLoaded,
    saveData, initData;

  data_map = {
    //格式为 显示的值:[文件名,mode名,是否加载,在codemirror显示的初始值,提交语言(也作为className),null]
    //最后的null增加了数组长度，标识该值为语言
    JavaScript: ['javascript', 'text/javascript', false, '//input your code here.', 'js', null],
    Go: ['go', 'text/x-go', false, 'package main\n\nfunc main(){\n}', 'go', null],
    C: ['clike', 'text/x-csrc', false, '#include<stdio.h>\n\nint main(){\n    return 0;\n}', 'c', null],
    'C++': ['clike', 'text/x-c++src', false, '#include<iostream>\nusing namespace std;\n\nint main(){\n    return 0;\n}', 'cpp', null],
    Python: ['python', 'text/x-python', false, '#input your code here.', 'py', null],
    Java: ['clike', 'text/x-java', false, 'public class main {\n    public static void main(String[] args) {\n    }\n}', 'java', null],
    Kotlin: ['clike', 'text/x-kotlin', false, 'fun main(){\n}', 'kotlin', null],
    Rust: ['rust', 'text/x-rustsrc', false, 'fn main(){\n}', 'rust', null],
    Haskell: ['haskell', 'text/x-haskell', false, 'main = putStrLn "Hello, World!"', 'haskell', null],
    //以下为风格,类名不能有特殊符号，且第一位不能为数字
    '3024-day': ['3024-day', '3024-day', false, null, 'day3024'],
    '3024-night': ['3024-night', '3024-night', false, null, 'night3024'],
    'abcdef': ['abcdef', 'abcdef', false, null, 'abcdef'],
    'ambiance': ['ambiance', 'ambiance', false, null, 'ambiance'],
    'ambiance-mobile': ['ambiance-mobile', 'ambiance-mobile', false, null, 'ambianceMobile'],
    'base16-dark': ['base16-dark', 'base16-dark', false, null, 'base16Dark'],
    'base16-light': ['base16-light', 'base16-light', false, null, 'base16Light'],
    'monokai': ['monokai', 'monokai', false, null, 'monokai'],
    'blackboard': ['blackboard', 'blackboard', false, null, 'blackboard'],
    'eclipse': ['eclipse', 'eclipse', false, null, 'eclipse'],
    'icecoder': ['icecoder', 'icecoder', false, null, 'icecoder'],
    'material': ['material', 'material', false, null, 'material'],
    'midnight': ['midnight', 'midnight', false, null, 'midnight'],
    'tomorrow-night-bright': ['tomorrow-night-bright', 'tomorrow-night-bright', false, null, 'tomorrow-night-bright'],
    'tomorrow-night-eighties': ['tomorrow-night-eighties', 'tomorrow-night-eighties', false, null, 'tomorrow-night-eighties'],
  };

  getMap = function(key) {
    return data_map[key] ? data_map[key] : undefined;
  };

  updateMapWhichLoaded = function(key) {
    data_map[key][2] = true;
  };

  initData = function() {
    var
      temp = window.localStorage.getItem('QknowData'),
      data = JSON.parse(temp),
      i;
    //如果data不存在
    if (!data) {
      data = {};
      for (i in data_map) {
        if (data_map.hasOwnProperty(i)) {
          if (data_map[i].length == 6) {
            data[i] = '';
          }
        }
      }
      //添加隐藏按钮和当时语言和主题的相关信息
      data['hideButtonClickBool'] = '';
      data['curLang'] = '';
      data['curTheme'] = '';
      data['showLineNumbers'] = '';
    }

    //再检测是否添加了新的项目
    for (i in data_map) {
      if (data_map.hasOwnProperty(i)) {
        if (data_map[i].length == 6) {
          //这里要检测该键下是否有值，若无，则初始化为空
          if (!data[i]) {
            data[i] = '';
          }
        }
      }
    }

    return data;
  }

  saveData = function(key, value, curLang, curTheme, hideButtonClickBool, showLineNumbers) {
    tempData[key] = value;
    tempData['curLang'] = curLang;
    tempData['curTheme'] = curTheme;
    tempData['hideButtonClickBool'] = hideButtonClickBool;
    tempData['showLineNumbers'] = showLineNumbers;
    //本地存储开始
    window.localStorage.setItem('QknowData', JSON.stringify(tempData));
  }

  return {
    initData: initData,
    saveData: saveData,
    getMap: getMap,
    updateMapWhichLoaded: updateMapWhichLoaded
  };
}());