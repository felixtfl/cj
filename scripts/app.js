// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


(function() {
    'use strict';
    var app = {
      isLoading: true,
      historys:{},
      selectedCities: [],
      spinner: document.querySelector('.loader'),
      cardTemplate: document.querySelector('.cardTemplate'),
      container: document.querySelector('.list'),
      cj5: {},
      keynames : {
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
  
    var requestURL = './cj5.json';
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();
    request.onload = function() {
       app.cj5 = request.response;
    }

    var input = document.getElementById("input").value;

    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/
  
    document.getElementById('btninput').addEventListener('click', function() {
      app.cjcheck(input.split('').reverse().join(''));
    });

    document.getElementById('btnmic').addEventListener('click', function() {
      startButton(this);
    });

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
        var recognition = new webkitSpeechRecognition();//SpeechRecognition()
        recognition.interimResults = true;
      
        recognition.onstart = function() {
          recognizing = true;
        };
      
        recognition.onerror = function(event) {
          console.log(event.error);
        };
      
        recognition.onend = function() {
          recognizing = false;
        };
      
        recognition.onresult = function(event) {
          var interim_transcript = '';
          for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final_transcript += event.results[i][0].transcript;
            } else {
              interim_transcript += event.results[i][0].transcript;
            }
          }
          input = final_transcript;
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
        recognition.lang = 'zh-HK'||'yue-HK'||'yue-Hant-HK';
        recognition.start();
        input = '';
      }

    /*****************************************************************************
     *
     * Methods to update/refresh the UI
     *
     ****************************************************************************/

    app.displayCJ = function(data){
      for(var i=0;i<=data.words.length-1;i++){
        var word = app.cardTemplate.cloneNode(true);
        word.classList.remove('cardTemplate');
        word.querySelector('.word').textContent = data.words[i];
        word.querySelector('.cj').textContent = data.cj[i];
        word.querySelector('.cjc').textContent = data.cjc[i];
        word.removeAttribute('hidden');
        //app.container.appendChild(word);
        app.container.insertBefore(word,app.container.firstChild);
      }
      if (app.isLoading) {
        app.spinner.setAttribute('hidden', true);
        app.container.removeAttribute('hidden');
        app.isLoading = false;
      }
    };

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
    app.cjcheck = function(words) {
      var output = {words:words,cj:{},cjc:{}};
      var cj = "";
      for(var i=0;i<words.length;i++){
        output["cj"][i]=app.cj5[words.charAt(i)]
        cj="";
        for(var t=0;t<output["cj"][i].length;t++){
          cj+=app.keynames[output["cj"][i].charAt(t)];
          //outputc[output[i]]=cj;
          output["cjc"][i]=cj;
        }
    }
    app.displayCJ(output);
    };
  
    // TODO add startup code here
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
  })();
  