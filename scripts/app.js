(function () {
  'use strict';
  var app = {
    historys: "",
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.list'),
    cj5: {},
    keynames: {
      "a": "日",
      "b": "月",
      "c": "金",
      "d": "木",
      "e": "水",
      "f": "火",
      "g": "土",
      "h": "竹",
      "i": "戈",
      "j": "十",
      "k": "大",
      "l": "中",
      "m": "一",
      "n": "弓",
      "o": "人",
      "p": "心",
      "q": "手",
      "r": "口",
      "s": "尸",
      "t": "廿",
      "u": "山",
      "v": "女",
      "w": "田",
      "x": "難",
      "y": "卜",
      "z": "重"
    }
  };

  fetch('./cj5.json')
    .then(
      function (response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }
        // Examine the text in the response
        response.json().then(function (data) {
          app.cj5 = data;
          if (app.historys.length != 0) {
            app.cjcheck(app.historys.split('').reverse().join(''));
          }
        });
      }
    )
    .catch(function (err) {
      console.log('Fetch Error :-S', err);
    });

  if (typeof (Storage) !== "undefined") {
    if (localStorage.getItem("words") != null) {
      app.historys = localStorage.getItem("words");
    }
  } else {
    // Sorry! No Web Storage support..
  }

  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  document.getElementById('btninput').addEventListener('click', function () {
    app.cjcheck(document.getElementById("input").value.split('').reverse().join('').replace(/[a-zA-Z0-9 `|!@#$%^&*()\[\]{},;:'"?><.\=\+\-*\/]/g, ""));
  });

  document.getElementById('btnClear').addEventListener('click', function () {
    if (app.historys.length > 0) {
      app.removeCJ(app.historys);
    } else {
      var data = {
        message: 'No history found'
      };
      var snackbarContainer = document.querySelector("#toastMsg");
      snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }
  });

  document.getElementById('btnmic').addEventListener('click', startButton);

  // document.getElementById('form').onsubmit = function() {
  //   app.cjcheck(input.split('').reverse().join(''));
  // }

  // document.getElementById("input").addEventListener("keyup", function(event) {
  //   event.preventDefault();
  //   if (event.keyCode === 13) {
  //       document.getElementById("btninput").click();
  //  }
  // });

  var final_transcript = '';
  var recognizing = false;

  if (!('webkitSpeechRecognition' in window)) {
    upgrade();
  } else {
    var recognition = new webkitSpeechRecognition(); //SpeechRecognition()
    //recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function () {
      recognizing = true;
      console.log('mic start');
    };

    recognition.onerror = function (event) {
      console.log(event.error);
    };

    recognition.onend = function () {
      recognizing = false;
      console.log('mic end');
      document.getElementById('mictooltip').innerHTML = 'Click to record';
      document.getElementById("btninput").click();
      if (!final_transcript) {
        return;
      }
      // if (window.getSelection) {
      //   window.getSelection().removeAllRanges();
      //   var range = document.createRange();
      //   range.selectNode(input);
      //   window.getSelection().addRange(range);
      // }
    };

    recognition.onresult = function (event) {
      var interim_transcript = '';
      document.getElementById('interim_transcript').innerHTML = '';
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      final_transcript = final_transcript;
      document.getElementById("input").value = final_transcript;
      document.getElementById('interim_transcript').innerHTML = interim_transcript;
      console.log(interim_transcript);
    };
  }

  // var two_line = /\n\n/g;
  // var one_line = /\n/g;
  // function linebreak(s) {
  //   return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
  // }

  function startButton(event) {
    if (recognizing) {
      recognition.stop();
      return;
    }
    final_transcript = '';
    //document.getElementById("input").value = ' ';
    document.getElementById('mictooltip').innerHTML = 'Listening';
    recognition.lang = 'zh-HK' || 'yue-HK' || 'yue-Hant-HK';
    recognition.start();
  }

  var synth = window.speechSynthesis;

  function speak(word) {
    if (word !== '') {
      var utterThis = new SpeechSynthesisUtterance(word);
      utterThis.lang = 'zh-HK' || 'yue-HK' || 'yue-Hant-HK';
      synth.speak(utterThis);
    }
  }

  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  app.displayCJ = function (data) {
    for (var i = 0; i <= data.words.length - 1; i++) {
      var word = app.cardTemplate.cloneNode(true);
      word.classList.remove('cardTemplate');
      word.id = data.words[i];
      word.querySelector('.word').textContent = data.words[i];
      word.querySelector('.cj').textContent = data.cj[i];
      word.querySelector('.cjc').textContent = data.cjc[i];
      word.removeAttribute('hidden');
      //remove duplicates
      app.removeCJ(data.words[i]);
      //add swipe action
      var mc = new Hammer(word);
      mc.on("panleft", function (ev) {
        app.removeCJ(ev.target.innerText.charAt(0));
        if (ev.target.parentNode != null) {
          app.removeCJ(ev.target.parentNode.innerText.charAt(0));
        }
      });
      app.container.insertBefore(word, app.container.firstChild);
    }
  };

  app.removeCJ = function (words) {
    if(typeof (words) == undefined){
      return;
    }
    for (var i = 0; i < words.length; i++) {
      var element = document.getElementById(words.charAt(i));
      if (element != null) {
        element.remove();
      }
      app.historys = app.historys.replace(words.charAt(i),"");
    }
    localStorage.setItem("words", app.historys);
  }

  function upgrade() {
    document.getElementById('btnmic').style.visibility = 'hidden';
    //showInfo('info_upgrade');
  }
  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/

  // Search the cj
  app.cjcheck = function (words) {
    var output = {
      words: words,
      cj: {},
      cjc: {}
    };
    for (var i = 0; i < words.length; i++) {
      output["cj"][i] = app.cj5[words.charAt(i)];
      var cj = "";
      for (var t = 0; t < output["cj"][i].length; t++) {
        cj += app.keynames[output["cj"][i].charAt(t)];
        //outputc[output[i]]=cj;
        output["cjc"][i] = cj;
      }
    }
    app.displayCJ(output);
    // update history
    var historyStr = words.split('').reverse().join('')+app.historys;
    app.historys = historyStr;
    localStorage.setItem("words", app.historys);
  };

  // TODO add startup code here
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(function () {
        console.log('Service Worker Registered');
      });
  }
})();
