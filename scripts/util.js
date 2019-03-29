var util = (function() {
  "use strict";
  var
    //用来创建列表
    selector, create_parent, create_child, deal_selector_array,
    //ajax相关
    create_XHR, ajax,
    //检测类
    hasClass, addClass, removeClass,
    //区分对象
    isType,
    //动态脚本与样式
    loadScript, loadCss,
    //得到实际渲染的样式
    getStyle,
    //利用querySelectorAll获得元素
    $$,
    //点击事件模拟
    clickTrigger;

  clickTrigger = function(element) {
    var
      e;
    //IE
    if (document.all) {
      element.click();
    }
    // 其它浏览器
    else {
      e = document.createEvent("MouseEvents");
      e.initEvent("click", true, true);
      element.dispatchEvent(e);
    }
  }

  $$ = function(descriptor) {
    return document.querySelectorAll(descriptor);
  }

  loadCss = function(path, pause_callback, callback) {
    if (pause_callback) {
      pause_callback();
    }
    var
      stylesheet = loadCSS(path, document.getElementsByTagName('link')[0]);
    onloadCSS(stylesheet, function() {
      if (pause_callback) {
        pause_callback();
      }
      callback();
    });
  };

  //创建ajax
  create_XHR = function() {
    if (typeof XMLHttpRequest != 'undefined') {
      return new XMLHttpRequest();
    } else if (typeof ActiveXObject != 'undefined') {
      if (typeof create_XHR.activeXString != 'string') {
        var
          versions = ['MSXML2.XMLHttp.6.0', 'MSXML2.XMLHttp.3.0', 'MSXML2.XMLHttp'],
          i, len;
        for (i = 0, len = verions.length; i < len; i++) {
          try {
            new ActiveXObject(versions[i]);
            create_XHR.activeXString = versions[i];
            break;
          } catch (ex) {}
        }
      }
      return new ActiveXObject(create_XHR.activeXString);
    } else {
      throw new Error('No XHR object available.');
    }
  };

  //判断数组还是对象
  isType = function(obj) {
    var
      type = Object.prototype.toString.call(obj),
      result;
    switch (type) {
      case '[object Array]':
        result = 'Array';
        break;
      case '[object Object]':
        result = 'Object';
        break;
      case '[object String]':
        result = 'String';
        break;
      case '[object Boolean]':
        result = 'Boolean';
        break;
      case '[object Number]':
        result = 'Number';
        break;
      case '[object Null]':
        result = 'Null';
        break;
      case '[object RegExp]':
        result = 'RegExp';
        break;
      default:
        result = 'undefined';
    }

    return result;
  }

  //公有函数区
  loadScript = function(path, pause_callback, callback) {
    if (pause_callback) {
      pause_callback();
    }
    var script = document.createElement('script'),
      head = document.getElementsByTagName('head')[0];
    script.type = 'text/javascript';
    script.charset = 'UTF-8';
    script.src = path;
    if (script.addEventListener) {
      script.addEventListener('load', function() {
        if (pause_callback) {
          pause_callback();
        }
        callback();
      }, false);
    } else if (script.attachEvent) {
      script.attachEvent('onreadystatechange', function() {
        var target = window.event.srcElement;
        if (target.readyState == 'loaded') {
          if (pause_callback) {
            pause_callback();
          }
          callback();
        }
      });
    }
    head.appendChild(script);
  };

  //创建下拉框
  create_parent = function(parent_element_string, child_element_string, text_element_string, object) {
    var
      wrapper, element,
      value, className;

    if (isType(object) === 'Object') {

      value = object.value;
      className = object.className;
      element = document.createElement(parent_element_string);

      wrapper = create_child(child_element_string, text_element_string, value);
      addClass(wrapper, className);
      wrapper.appendChild(element);

      return wrapper;

    } else {
      return undefined;
    }

  };

  create_child = function(child_element_string, text_element_string, value) {
    var
      text_wrapper, element;

    element = document.createElement(child_element_string);

    text_wrapper = document.createElement(text_element_string);
    text_wrapper.innerHTML = value;

    element.appendChild(text_wrapper);

    return element;
  };

  deal_selector_array = function( /*parent,array,parent_element_string,child_element_string*/ option) {

    var
      parent = option.parent,
      array = option.array,
      parent_element_string = option.parent_element_string,
      child_element_string = option.child_element_string,
      text_element_string = option.text_element_string,
      child_wrapper, i;

    if (isType(array) !== 'Array' && parent === undefined) {
      return create_child(child_element_string, text_element_string, array);
    }

    child_wrapper = parent.getElementsByTagName(parent_element_string)[0] || parent;

    for (i = 1; i < array.length; i++) {
      child_wrapper.appendChild(deal_selector_array({
        parent: create_parent(parent_element_string, child_element_string, text_element_string, array[i][0]),
        array: array[i],
        parent_element_string: parent_element_string,
        child_element_string: child_element_string,
        text_element_string: text_element_string
      }))
    }

    return parent;
  };

  selector = function(option) {
    var
      i, wrapper,
      parent_element_string = option.parent_element_string ? option.parent_element_string : 'ul',
      child_element_string = option.child_element_string ? option.child_element_string : 'li',
      text_element_string = option.text_element_string ? option.text_element_string : 'p',
      root = option.root,
      array = option.array;

    //创建最外层父元素标签
    wrapper = document.createElement(parent_element_string);
    if (isType(array[0]) === 'Object') {
      if (array[0].className) {
        addClass(wrapper, array[0].className);
      }
    }

    root.appendChild(deal_selector_array({
      parent: wrapper,
      array: array,
      parent_element_string: parent_element_string,
      child_element_string: child_element_string,
      text_element_string: text_element_string,
    }));

    //去掉最外层的父元素标签
    root.children

    return root;
  };


  getStyle = function(element, cssPropertyName) {
    var
      cloneNode = element.cloneNode(true);
    if (window.getComputedStyle) {
      return window.getComputedStyle(element)[cssPropertyName];
    } else {
      return element.currentStyle[cssPropertyName];
    }
  };
  // getStyleForCssAuto = function(element, cssPropertyName, cssPropertyValue) {
  //   var
  //     test_zone, temp,
  //     cloneNode = element.cloneNode(true);
  //   cloneNode.style[cssPropertyName] = cssPropertyValue;
  //   if (!getStyleForCssAuto.test_zone) {
  //     getStyleForCssAuto.test_zone = document.createElement('div');
  //     getStyleForCssAuto.test_zone.style = 'height:0;width:0;position:absolute;left:120%;overflow:hidden';
  //     document.body.appendChild(getStyleForCssAuto.test_zone);
  //   }
  //   test_zone = getStyleForCssAuto.test_zone;
  //   test_zone.appendChild(cloneNode);
  //   temp = getStyle(cloneNode, cssPropertyName);
  //   //删除cloneNode
  //   test_zone.removeChild(cloneNode);

  //   //返回值
  //   return temp;
  // }

  //发出ajax请求
  ajax = function(option) {
    var
      xhr = create_XHR(),
      success = option.success,
      error = option.error,
      type = option.type,
      data = option.data,
      contentType = option.contentType,
      async = option.async ? option.async : true,
        url = option.url;

    xhr.onreadystatechange = function(event) {
      if (xhr.readyState == 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
          if (success instanceof Function) {
            success(xhr.responseText);
          }
        } else {
          if (error instanceof Function) {
            error();
          }
        }
      }
    };

    xhr.open(type, url, async);
    //xhr.setRequestHeader('Content-Type', contentType);
    xhr.send(data);
  };

  //检测制定的dom元素是否有某个className
  hasClass = function(ele, cls) {
    if (!ele.className) {
      return false;
    } else {
      return ele.className.indexOf(cls) > -1;
    }
  };

  //为指定的dom元素添加className
  addClass = function(ele, cls) {
    if (!hasClass(ele, cls)) {
      if (ele.className) {
        ele.className += " " + cls;
      } else {
        ele.className = cls;
      }
    };
  };

  //删除指定dom元素的指定className
  removeClass = function(ele, cls) {
    if (hasClass(ele, cls)) {
      var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
      ele.className = ele.className.replace(reg, "");
    }
  };

  return {
    selector: selector,
    ajax: ajax,
    addClass: addClass,
    hasClass: hasClass,
    removeClass: removeClass,
    loadScript: loadScript,
    loadCss: loadCss,
    getStyle: getStyle,
    // getStyleForCssAuto: getStyleForCssAuto,
    $$: $$,
    clickTrigger: clickTrigger
  };
}());