



function webOrtholog(webValues, callback) {
  webValues = JSON.parse(webValues).values;
  console.log("TestP!", webValues)

  var gene = [];
  var newGene = [];
  var selection = [];
  var selName = [];
  var selZero = {}

  //Dmel,Ortholog,GeneSymbol,OrthoDB
  Papa.parse('assets/data/orthologSearch.csv', {
    download: true,
    header: true,
    step: function (results) {
      const row = results.data;
      var stringify = JSON.stringify(row);
      stringify = stringify.replace("\ufeff", "");
      var reParsed = JSON.parse(stringify);
      gene.push(reParsed);
    },
    complete: function () {


      console.log("csv pipe ended");
      console.log(gene.length + " rows were loaded");
      var specList = ["Dmoj", "Dana", "Dvir", "Dpse", "Dsec", "Dwil", "Dper", "Dyak", "Dsim", "Dere", "Dgri"];

      // one zero list
      for (var i = 0; i < specList.length; i++) {
        selection[i] = webValues[i];
        if (webValues[i] === 1) {
          selName[i] = specList[i];
          selZero[specList[i]] = 0;
        }
      }
      console.log('one zero list finishied');
      console.log('selName = ', selName);
      console.log('selZero = ', selZero);


      console.log('databall start');
      databall = {}
      for (var i = 0; i < gene.length; i++) {
        if (!(gene[i].OrthoDB in databall)) {
          databall[gene[i].OrthoDB] = []
        }
        databall[gene[i].OrthoDB].push(gene[i].GeneSymbol.split('\\')[0])

      }
      console.log('databall end');

      console.log('find bad keys start');
      // find the bad keys
      let badkeys = []
      for (let key in databall) {
        // make a new dictionary of zero count keys
        let counts = JSON.parse(JSON.stringify(selZero)); // deep copy selZero from line 35

        let genesList = databall[key] // ex [dvir, dvir, dmoj, dere]

        // accumulate counts for each gene
        for (let i = 0; i < genesList.length; i++) {
          if ((genesList[i] in counts)) {
            counts[genesList[i]] += 1;
          }
        }
        // capture the bad keys, ie those counts which aren't exatly 1 each
        for (let geneKey in counts) {
          if (counts[geneKey] !== 1) {
            badkeys.push(key);
          }
        }
      }
      console.log('find bad keys end');

      console.log('remove bad keys start');
      // remove the bad keys
      badkeys.forEach(function (key) {
        delete databall[key];
      });
      console.log('remove bad keys end');

      console.log('good key search start');
      // only good keys remain
      //let goodKeys = Object.keys(databall); // using databall.hasOwnProperty(key) instead .... dictionary lookup w/ hash, O(1)
      //let searchCriteria = Object.keys(selZero); // using selZero.hasOwnProperty(key) .. same as above

      for (var i = 0; i < gene.length; i++) {
        let row = {
          Dmel: gene[i].Dmel,
          FBgn_Ortholog: gene[i].Ortholog,
          GeneSymbol: gene[i].GeneSymbol,
          OrthoDB: gene[i].OrthoDB
        };

        if ((databall.hasOwnProperty(row.OrthoDB)) && (selZero.hasOwnProperty(row.GeneSymbol.split('\\')[0]))) {
          newGene.push(row);
        }
      }
      console.log('good key search end');

      console.log('string build begin');
      var str = "";
      for (var i = 0; i < newGene.length; i++) {
        str += newGene[i].Dmel + "\t" + newGene[i].FBgn_Ortholog + "\t" + newGene[i].GeneSymbol + "\t" + newGene[i].OrthoDB + "\n";
      }
      console.log('string build end');

      callback(str);

      /*
      const randomFile = Math.floor(Math.random() * 1000);
  
      fs.writeFile(
        "./public/"+randomFile+".txt",
        str,
        function (err) { 
          if (err) {
            console.log(err);
            console.log("failed to write file, expect a timeout");
          } else {
            console.log("wrote file", randomFile);
            callback(randomFile)
          }
        });
        */
    }
  });
}

window.onload = function () {
  const btn = document.querySelector(".button");
  document.querySelector("button").addEventListener('click', (event) => {
    btn.classList.add("button--loading");
    var inputs = document.querySelectorAll("input");
    var values = [];
    for (var i = 0; i < 11; i++) {
      values.push(inputs[i].checked ? 1 : 0);
    }


    webOrtholog(JSON.stringify({ values }), function (str) {
      console.log('web ortho search');
      console.log(str);
      const data = str.split('\n');

      let html = '<table border="1"><tr><th>Dmel</th><th>Ortho_ID</th><th>Species_ID</th><th>EOG</th></tr>';

      for (var i = 0; i < data.length; i++) {
        const row = data[i].split('\t');
        html += '<tr>';
        for (var k = 0; k < row.length; k++) {
          html += '<td>' + row[k] + '</td>';
        }
        html += '</tr>';
      }
      btn.classList.remove("button--loading");
      document.write(html);
    });
  });
};