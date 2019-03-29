//全局
var
  tempData = data.initData();

(function() {
  //定义提交代码的url
  var
    submitURL = '/runcode',
    languagesPath = './scripts/languages/',
    themesPath = './styles/themes/',
    selectorsZone = document.createElement('div'),
    loadingZone = document.createElement('div'),
    liLanguages, liThemes, getOffsetTop,
    changeSelectors, toggleLoadingAnimate, my_codeMirror,
    liLanguagesP, liThemesP,
    firstClickLanguages = false,
    firstClickThemes = false,
    curLangElement = null,
    curThemeElement = null,
    //这里定义初始语言和风格
    curLang = tempData['curLang'] ? tempData['curLang'] : 'C',
    curTheme = tempData['curTheme'] ? tempData['curTheme'] : 'eclipse',
    //这里定义初始结果栏是否显示，opened为显示，closed为不显示
    hideButtonClickBool = tempData['hideButtonClickBool'] ? tempData['hideButtonClickBool'] : 'opened',
    saveTipTimer,
    //这里定义多少秒自动存储一次
    saveTime = 10,
    tempSaveTime = saveTime,
    readyToResizeClear, wrapperForM, i,
    new_div, selectorsZoneChildren, fPlus,
    firstCheck = false,
    fMinus, adjustZone,
    //这里可以定义初始字体大小，以及缩放倍数(可以扩充或减少数组)
    initFontSize = 16,
    curMulitiple = 1,
    fontSizeMultiple = [0.5, 0.8, 1, 1.2, 1.5, 2],
    codemirror_zone, readyToResizeClear2,
    editorForMFlag = true,
    submitForMFlag = true,
    stateForMArray = ['bottom', 'middle', 'top'],
    curStateForM = 'bottom',
    //这里设置默认是否打开行号
    showLineNumbers = tempData['showLineNumbers'] ? tempData['showLineNumbers'] : 'opened';

  //这里是自动保存的定时器
  saveTipTimer = function(element) {
    element.innerText = tempSaveTime + 's后自动保存';
    tempSaveTime--;
    if (tempSaveTime == 0) {
      data.saveData(curLang, my_codeMirror.getValue(), curLang, curTheme, hideButtonClickBool, showLineNumbers);
      tempSaveTime = saveTime;
    }
    setTimeout(function() { saveTipTimer(element) }, 1000);
  };

  //给selectorsZone添加一个元素;
  selectorsZone.innerHTML = String() +
    '<div class="aboutQknow">关于<span class="awesomeFont">Qknow</span></div>' +
    '<div class="menuButtonForMWrapper">' +
    '<div class="menuButtonForM"></div>' +
    '</div>' +
    '<div class="secondWrapperForM">' +
    '<div class="wrapperForM">' +
    '<div class="clear">清除代码</div>' +
    '<div class="lineNumbers">开启行号</div>' +
    '<div class="LNZone"></div>' +
    '<div class="adjustFSize">字体大小</div>' +
    '<div class="adjustZone">' +
    '<div class="fPlus">+</div>' +
    '<div class="fMinus">-</div>' +
    '</div>' +
    '</div>' +
    '</div>';

  //初始化loadingZone
  loadingZone.id = 'loading';
  loadingZone.innerText = 'Loading...';
  loadingZone._animate_state = false;

  toggleLoadingAnimate = function() {
    if (!loadingZone._animate_state) {
      util.addClass(loadingZone, 'show');
      loadingZone._animate_state = true;
    } else {
      util.removeClass(loadingZone, 'show');
      loadingZone._animate_state = false;
    }
  };

  getOffsetTop = function(ancestor, element) {
    return parseFloat(element.offsetTop);
  }

  window.onload = function() {
    var
      uls, i, new_div, ps,
      submit_button = util.$$('#submit')[0],
      result_zone = util.$$('#result')[0],
      result_wrapper = util.$$('#resultWrapper')[0],
      wrapper = util.$$('#wrapper')[0],
      content = util.$$('#content')[0],
      hideButton = util.$$('#hideButton')[0],
      saveTip = util.$$('#saveTip')[0],
      bg = util.$$('#bg')[0],
      copy_button = util.$$('#copy')[0],
      copy_transfer = util.$$('#copyTransfer')[0],
      pre_text = copy_button.innerText,
      menuButtonForMWrapper, menuButtonForM,
      hideButtonForM = util.$$('#hideButtonForM')[0],
      hideButtonForMChild = hideButtonForM.children[0],
      hideButtonWrapper = util.$$('#hideButtonWrapper')[0],
      resultSecondWrapper = util.$$('#resultSecondWrapper')[0],
      inputArea = util.$$('#inputArea')[0],
      bg2 = util.$$('#bg2')[0],
      awesomeFont, aboutQknow, LNZone,
      clearButton;

    //去掉遮罩
    util.removeClass(bg2, 'show');

    //定义事件处理程序并初始化hideButtonForM的状态
    util.addClass(content, curStateForM);

    hideButtonForM.onclick = function() {
      var
        index = stateForMArray.indexOf(curStateForM);

      hideButtonForMChild.innerText = '>';
      util.removeClass(content, 'fontShow');

      if ((curStateForM == 'middle' || curStateForM == 'top') && (!editorForMFlag || !submitForMFlag)) {
        util.removeClass(content, 'top');
        util.addClass(content, 'middle');
        curStateForM = 'middle';
        return false;
      } else if (curStateForM == 'bottom' && (!editorForMFlag || !submitForMFlag)) {
        util.removeClass(content, 'bottom');
        util.removeClass(content, 'middle');
        if (!editorForMFlag) {
          util.addClass(content, 'bottom');
          return false;
        } else {
          util.addClass(content, 'middle');
          util.addClass(content, 'fontShow');
          hideButtonForMChild.innerText = '轻触编译器可直接关闭结果栏。';
          return false;
        }
      }

      util.removeClass(content, curStateForM);

      if (stateForMArray[index + 1]) {
        curStateForM = stateForMArray[index + 1];
      } else {
        curStateForM = stateForMArray[0];
      }

      util.addClass(content, curStateForM);
    };

    copy_button.onclick = function() {
      try {
        copy_transfer.value = result_zone.innerText;
        copy_transfer.focus();
        copy_transfer.select();
        document.execCommand('Copy', false, null);
        copy_button.innerText = '复制成功';
      } catch (e) {
        copy_button.innerText = '复制失败';
      }
      util.addClass(copy_button, 'showResult');
      setTimeout(function() {
        util.removeClass(copy_button, 'showResult');
        copy_button.innerText = pre_text;
      }, 2000)
    };

    //对于hideButton的控制,这里content有show类，即指结果栏关闭，则hideButtonClick为false，反之类推
    hideButton.onclick = function(event) {
      //阻止冒泡
      window.event ? window.event.cancelBubble = true : event.stopPropagation();

      if (util.hasClass(content, 'show')) {
        util.removeClass(content, 'show');
        hideButtonClickBool = 'opened';
      } else {
        util.addClass(content, 'show');
        hideButtonClickBool = 'closed';
      }
      data.saveData(curLang, my_codeMirror.getValue(), curLang, curTheme, hideButtonClickBool, showLineNumbers);
    };

    //codemirror初始化
    my_codeMirror = CodeMirror.fromTextArea(util.$$('#input')[0], {
      scrollbarStyle: null,
      indentUnit: 4,
      tabSize: 4,
      indentWithTabs: false,
      extraKeys: {
        Tab: (cm) => cm.execCommand("indentMore"),
        "Shift-Tab": (cm) => cm.execCommand("indentLess"),
      },
    });

    my_codeMirror.on('focus', function() {
      bg.style.animationPlayState = "paused";
      bg.style.WebkitAnimationPlayState = "paused";

      //移动端结果弹出
      editorForMFlag = false;
      util.clickTrigger(hideButtonForM);
      editorForMFlag = true;
    });

    my_codeMirror.on('blur', function() {
      bg.style.animationPlayState = "running";
      bg.style.WebkitAnimationPlayState = "running";
    });

    //初始化codemirror字体大小
    codemirror_zone = util.$$('.CodeMirror')[0];
    codemirror_zone.style.fontSize = initFontSize + 'px';

    //开始插入selectorsZone
    result_wrapper.insertBefore(selectorsZone, result_wrapper.children[0]);

    //清除按钮
    clearButton = selectorsZone.querySelector('.clear');

    clearButton.onclick = function() {
      var
        value = data.getMap(curLang)[3];
      my_codeMirror.setOption('value', '');
      my_codeMirror.setOption('value', value);
    };

    //行号点击
    LNZone = util.$$('.LNZone')[0];

    if (showLineNumbers == 'opened') {
      util.addClass(LNZone, 'showLN');
      my_codeMirror.setOption('lineNumbers', true);
    }

    LNZone.onclick = function() {
      if (util.hasClass(this, 'showLN')) {
        util.removeClass(this, 'showLN');
        my_codeMirror.setOption('lineNumbers', false);
        showLineNumbers = 'closed';
        data.saveData(curLang, my_codeMirror.getValue(), curLang, curTheme, hideButtonClickBool, showLineNumbers);
      } else {
        util.addClass(this, 'showLN');
        my_codeMirror.setOption('lineNumbers', true);
        showLineNumbers = 'opened';
        data.saveData(curLang, my_codeMirror.getValue(), curLang, curTheme, hideButtonClickBool, showLineNumbers);
      }
    };

    //字体点击
    awesomeFont = util.$$('.awesomeFont')[0];
    aboutQknow = util.$$('.aboutQknow')[0];

    aboutQknow.onclick = function() {
      util.hasClass(awesomeFont, 'show') ? util.removeClass(awesomeFont, 'show') : util.addClass(awesomeFont, 'show');
    };

    //这里要为移动端做准备
    menuButtonForMWrapper = util.$$('.menuButtonForMWrapper')[0];
    menuButtonForM = util.$$('.menuButtonForM')[0];

    menuButtonForMWrapper.onclick = function() {
      util.hasClass(menuButtonForMWrapper, 'show') ? util.removeClass(menuButtonForMWrapper, 'show') : util.addClass(menuButtonForMWrapper, 'show');
    };
    //开始插入loadingZone
    wrapper.appendChild(loadingZone);

    //这里定义初始的语言以及代码风格
    util.clickTrigger(selectorsZone.querySelector('.' + data.getMap(curLang)[4]));
    util.clickTrigger(selectorsZone.querySelector('.' + data.getMap(curTheme)[4]));
    firstCheck = true;

    submit_button.onclick = function submitClick(event) {

      //阻止冒泡
      window.event ? window.event.cancelBubble = true : event.stopPropagation();

      var
        value, runLang, jsc;
      //先暂时解绑，以防多次提交
      submit_button.onclick = null;

      value = my_codeMirror.getValue();

      if (!value) {
        return false;
      }

      //保存一次
      data.saveData(curLang, my_codeMirror.getValue(), curLang, curTheme, hideButtonClickBool, showLineNumbers);

      //数据整理
      runLang = data.getMap(curLang);
      jsc = new FormData();
      jsc.append('lang', runLang[4]);
      jsc.append('code', value);
      jsc.append('input',inputArea.value);

      //开始loading动画
      toggleLoadingAnimate();

      util.ajax({
        type: 'post',
        url: submitURL,
        data: jsc,
        success: function(data) {
          //暂停loading动画
          toggleLoadingAnimate();

          result_zone.innerText = data;
          submit_button.onclick = submitClick;
        }
      });

      //移动端结果弹出
      submitForMFlag = false;
      util.clickTrigger(hideButtonForM);
      submitForMFlag = true;
    };

    //这里添加codemirror相关键盘命令
    //CodeMirror.commands.undo = my_codeMirror;

    //全局键盘事件
    document.onkeydown = function(e) {
      var
        evn = e || event,
        code = evn.keyCode || evn.which || evn.charCode;

      if (code == 13 && evn.ctrlKey) {
        util.clickTrigger(submit_button);
      }
    }

    //开始启动自动保存定时器
    saveTipTimer(saveTip);

    //根据保存是否开启结果栏
    if (hideButtonClickBool == 'closed') {
      util.clickTrigger(hideButton);
    }

    //模拟下拉框失焦
    document.body.onclick = function() {
      if (util.hasClass(liLanguagesP, 'titleSelected')) {
        util.clickTrigger(liLanguagesP);
      }
      if (util.hasClass(liThemesP, 'titleSelected')) {
        util.clickTrigger(liThemesP);
      }
    };

    //在这里处理缩放事件
    document.body.onresize = function readyToResize() {
      if (readyToResizeClear) {
        clearTimeout(readyToResizeClear);
      }

      readyToResizeClear = setTimeout(function() {
        document.documentElement.style.fontSize = (document.body.clientWidth / 1536 * 625) + "%";
      }, 600);
    };

    // document.body.onorientationChange = function readyToResize2() {
    //   if (readyToResizeClear2) {
    //     clearTimeout(readyToResizeClear2);
    //   }

    //   readyToResizeClear2 = setTimeout(function() {
    //     document.documentElement.style.fontSize = 0.5*(document.body.clientWidth / 1536 * 625) + "%";
    //   }, 600);
    // };

    //手动触发一次缩放事件
    window.dispatchEvent(new Event('resize'));

  };

  //定义新创建的元素的id
  selectorsZone.id = 'selectors';
  //向selectorsZone里面开始填充数据
  util.selector({
    root: selectorsZone,
    array: [{ className: 'selectors_wrapper' },
      [{ value: '语言', className: 'topic languages' },
        'C',
        'C++',
        'Java',
        'Go',
        'Python',
        [{ value: '其他语言', className: 'topic another_languages' },
          'JavaScript',
          'Rust',
          'Haskell',
          'Kotlin',
        ]
      ]
    ]
  });

  util.selector({
    root: selectorsZone,
    array: [{ className: 'selectors_wrapper' },
      [{ value: '风格', className: 'topic themes' },
        'ambiance',
        'monokai',
        'blackboard',
        'eclipse',
        'icecoder',
        'material',
        'midnight',
        'tomorrow-night-bright',
        'tomorrow-night-eighties'
      ],
    ]
  });

  liLanguages = selectorsZone.querySelector('.languages');
  liThemes = selectorsZone.querySelector('.themes');
  //分别获取一级标题下两个p元素
  liLanguagesP = liLanguages.children[0];
  liThemesP = liThemes.children[0];
  //获取为移动端准备的wrapper
  wrapperForM = selectorsZone.querySelector('.wrapperForM');
  //获取调整字号的两个按钮,以及包裹它们的父元素
  adjustZone = selectorsZone.querySelector('.adjustZone');
  fPlus = selectorsZone.querySelector('.fPlus');
  fMinus = selectorsZone.querySelector('.fMinus');

  adjustZone.onclick = function(event) {
    var
      index = fontSizeMultiple.indexOf(curMulitiple);
    //阻止冒泡
    window.event ? window.event.cancelBubble = true : event.stopPropagation();

    if (util.hasClass(event.target, 'fPlus')) {
      codemirror_zone.style.fontSize = (fontSizeMultiple[index + 1] ? fontSizeMultiple[++index] : curMulitiple) * initFontSize + 'px';
    } else if (util.hasClass(event.target, 'fMinus')) {
      codemirror_zone.style.fontSize = (fontSizeMultiple[index - 1] ? fontSizeMultiple[--index] : curMulitiple) * initFontSize + 'px';
    }

    curMulitiple = fontSizeMultiple[index];

    return false;
  }
  //后面两个循环分别给ul套div元素和加类

  uls = selectorsZone.getElementsByTagName('ul');

  for (i = 0; i < uls.length; i++) {
    new_div = document.createElement('div');
    new_div.className = 'div_wrapper';
    uls[i].parentNode.insertBefore(new_div, uls[i]);
    new_div.appendChild(uls[i]);
  }

  //这里要为移动端部署做准备,把两个下拉框放到wrapperForM里
  selectorsZoneChildren = selectorsZone.children;
  wrapperForM.appendChild(selectorsZoneChildren[selectorsZoneChildren.length - 2]);
  wrapperForM.appendChild(selectorsZoneChildren[selectorsZoneChildren.length - 1]);

  ps = wrapperForM.getElementsByTagName('p');

  for (i = 0; i < ps.length; i++) {
    if (!util.hasClass(ps[i].parentNode, 'languages') && !util.hasClass(ps[i].parentNode, 'themes') &&
      !util.hasClass(ps[i], 'topic')) {
      util.addClass(ps[i], data.getMap(ps[i].innerText)[4]);
    }
  }

  //在liLanguages上进行事件委托
  liLanguages.onclick = function(event) {
    var
      height, ul, parent,
      target = event.target,
      parent = target.parentNode,
      temp, div_wrapper, scrollTop,
      temp_scrollTop, temp_li_height, p,
      preLang;

    //阻止冒泡
    window.event ? window.event.cancelBubble = true : event.stopPropagation();

    if (parent.nodeName == 'LI' && parent.children.length == 2) {
      p = parent.children[0];
      div_wrapper = parent.children[1];
      temp = div_wrapper.style.height;
      ul = div_wrapper.children[0];
      //获得ul实际渲染的高度
      height = util.getStyle(ul, 'height');
      if (!temp || parseFloat(temp) === 0) {
        //更新滚动距离
        scrollTop = getOffsetTop(liLanguages, parent);

        setTimeout(function a() {
          if (liLanguages.scrollTop < scrollTop) {
            liLanguages.scrollTop += 3;
            if (temp_li_height != util.getStyle(ul, 'height') || temp_scrollTop != liLanguages.scrollTop) {
              temp_li_height = util.getStyle(ul, 'height');
              temp_scrollTop = liLanguages.scrollTop;
              setTimeout(a, 20);
            }
          }
        }, 100);

        //开始更新元素高度
        div_wrapper.style.height = height;

        setTimeout(function() {
          div_wrapper.style.height = 'auto';
        }, 200);
      } else {
        //开始更新元素高度
        div_wrapper.style.height = height;

        setTimeout(function() {
          div_wrapper.style.height = 0;
        }, 1);
      }
      if (util.hasClass(p, 'titleSelected')) {
        util.removeClass(p, 'titleSelected');
      } else {
        util.addClass(p, 'titleSelected');
      }
    } else if (target.nodeName == 'P') {
      //更改一级标题栏的文字
      liLanguagesP.innerText = target.innerHTML;
      //存储当前选中的文字
      preLang = curLang;
      curLang = target.innerHTML;
      //在更改curLang之后，再存储一次
      if (firstCheck) {
        data.saveData(preLang, my_codeMirror.getValue(), curLang, curTheme, hideButtonClickBool, showLineNumbers);
      }
      //开始根据选中的文字更改选择器
      changeSelectors(target.innerHTML, 'languages');
      //存储当前点击的元素，为了去掉加的类
      if (curLangElement) {
        util.removeClass(curLangElement, 'selected');
      }
      curLangElement = target;
      util.addClass(target, 'selected');
      if (firstClickLanguages) {
        util.clickTrigger(liLanguagesP);
      } else {
        firstClickLanguages = true;
      }
    }
  };

  //在liThemes上进行事件委托
  liThemes.onclick = function(event) {
    var
      height, ul, parent,
      target = event.target,
      parent = target.parentNode,
      temp, div_wrapper, temp_li_height, p;

    //阻止冒泡
    window.event ? window.event.cancelBubble = true : event.stopPropagation();

    if (parent.nodeName == 'LI' && parent.children.length == 2) {
      p = parent.children[0];
      div_wrapper = parent.children[1];
      temp = div_wrapper.style.height;
      ul = div_wrapper.children[0];
      //获得ul实际渲染的高度
      height = util.getStyle(ul, 'height');
      if (!temp || parseFloat(temp) === 0) {
        //更新滚动距离
        scrollTop = getOffsetTop(liThemes, parent);

        setTimeout(function a() {
          if (liThemes.scrollTop < scrollTop) {
            liThemes.scrollTop += 3;
            if (temp_li_height != util.getStyle(ul, 'height') || temp_scrollTop != liThemes.scrollTop) {
              temp_li_height = util.getStyle(ul, 'height');
              temp_scrollTop = liThemes.scrollTop;
              setTimeout(a, 20);
            }
          }
        }, 100);

        //开始更新元素高度
        div_wrapper.style.height = height;

        setTimeout(function() {
          div_wrapper.style.height = 'auto';
        }, 200);
      } else {
        //开始更新元素高度
        div_wrapper.style.height = height;

        setTimeout(function() {
          div_wrapper.style.height = 0;
        }, 1);
      }
      if (util.hasClass(p, 'titleSelected')) {
        util.removeClass(p, 'titleSelected');
      } else {
        util.addClass(p, 'titleSelected');
      }
    } else if (target.nodeName == 'P') {
      liThemesP.innerText = target.innerHTML;
      curTheme = target.innerHTML;
      changeSelectors(target.innerHTML, 'themes');
      //在更改curTheme之后，再存储一次
      if (firstCheck) {
        data.saveData(curLang, my_codeMirror.getValue(), curLang, curTheme, hideButtonClickBool, showLineNumbers);
      }
      if (curThemeElement) {
        util.removeClass(curThemeElement, 'selected');
      }
      curThemeElement = target;
      util.addClass(target, 'selected');
      if (firstClickThemes) {
        util.clickTrigger(liThemesP);
      } else {
        firstClickThemes = true;
      }
    }
  };

  changeSelectors = function(key, type) {
    var
      value_for_codemirror, filename, is_loaded,
      text_for_codemirror, data_array;

    data_array = data.getMap(key);

    value_for_codemirror = data_array[1];
    is_loaded = data_array[2];
    text_for_codemirror = tempData[curLang] ? tempData[curLang] : data_array[3];

    if (!is_loaded) {
      if (type == 'languages') {
        filename = languagesPath + data_array[0] + '.js';
        util.loadScript(filename, toggleLoadingAnimate,
          function() {
            data.updateMapWhichLoaded(key);
            my_codeMirror.setOption('mode', value_for_codemirror);
            if (text_for_codemirror) {
              my_codeMirror.setOption('value', text_for_codemirror);
            }
          });
      } else if (type = 'themes') {
        filename = themesPath + data_array[0] + '.css';
        util.loadCss(filename, toggleLoadingAnimate,
          function() {
            data.updateMapWhichLoaded(key);
            my_codeMirror.setOption('theme', value_for_codemirror);
          })
      }
    }

    //以下代码是为加载过的文件准备的，因为回调函数有延迟，所以代码写得丑陋
    if (is_loaded) {
      if (type == 'languages') {
        my_codeMirror.setOption('mode', value_for_codemirror);
        if (text_for_codemirror) {
          my_codeMirror.setOption('value', text_for_codemirror);
        }
      } else if (type == 'themes') {
        my_codeMirror.setOption('theme', value_for_codemirror);
      }
    }
  }
}())