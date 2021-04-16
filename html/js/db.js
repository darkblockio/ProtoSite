
$(document).keyup(function(e) {
     if (e.key === "Escape") { // escape key maps to keycode `27`
	   console.log( "escape detected!" );
       gallery();
    }
});

async function gallery(){
	assetQuery('query {  transactions(first: 500,    tags: { name: \"Uploading-App\", values: [\"Darkblock\"] }  ) {    edges {      node {        id tags { name value }      }    }  }}');
}
async function assetQuery(query){
//curl 'https://arweave.net/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' 
//-H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: https://arweave.net' --data-binary '{"query":"query {  transactions(    tags: { name: \"Uploading-App\", values: [\"Darkblock\"] }  ) {    edges {      node {        id tags { name value }      }    }  }}"}' --compressed
		var request = new XMLHttpRequest();
		request.open( 'GET', 'https://arweave.net/graphql?query='  +encodeURIComponent(query), false );
		//request.setRequestHeader('Accept-Encoding', 'gzip, deflate, br');
		request.setRequestHeader('Content-Type', 'application/json');
		request.setRequestHeader('Accept', 'application/json');
		//request.setRequestHeader('DNT', '1');
		//request.setRequestHeader('Origin', 'https://arweave.net');
		request.send();
		//console.log(request.responseText);
		var resp = await JSON.parse( request.responseText );
		//resp.data.transactions.edges.forEach(edge => document.write(edge.node.id + "<br>"));

		resp.data.transactions.edges.forEach(function(edge){ 
			var thumbId;
			var title;
			contracts[edge.node.id] = edge.node.id;
			console.log( edge.node.tags );
			edge.node.tags.forEach(function(t){
				if( t.name === 'thumbnail' ){
					edge.node.thumbId = t.value;
				}
				if( t.name === 'Title' ){
					edge.node.title = t.value;
				}
				if( t.name === 'Init-State' ){
					console.log( edge.node.id + " : " + t.value );
					edge.node['originalOwner'] = t.value.split('"')[3];//terribl. can't get the json to parse for some reason'
				}
			});
			assets.push( edge.node );

		});
		console.log( contracts );

		var contractString = '"' + Object.values(contracts).join('","') + '"'
		//console.log( contractString );
		await stateQuery('query {  transactions(first: 500,    tags: { name: "Contract", values: [' + contractString + '] }  ) {    edges {      node {        id tags { name value }      }    }  }}');
}
var gstring = '<center><div class="gal" style="width:600px;margin-bottom: 50px;"><a target="_blank" href="IMG"><img src="IMG" alt="TITLE" style="width:600px;"></a><div class="desc">TITLE - <input type=button value=transfer onclick=transferBox(\'ASSETID\')></div></div><br><br></center>';
async function stateQuery(query){
		console.log( query );
//curl 'https://arweave.net/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' 
//-H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: https://arweave.net' --data-binary '{"query":"query {  transactions(    tags: { name: \"Uploading-App\", values: [\"Darkblock\"] }  ) {    edges {      node {        id tags { name value }      }    }  }}"}' --compressed
		var request = new XMLHttpRequest();
		request.open( 'GET', 'https://arweave.net/graphql?query='  +encodeURIComponent(query), false );
		//request.setRequestHeader('Accept-Encoding', 'gzip, deflate, br');
		request.setRequestHeader('Content-Type', 'application/json');
		request.setRequestHeader('Accept', 'application/json');
		//request.setRequestHeader('DNT', '1');
		//request.setRequestHeader('Origin', 'https://arweave.net');
		request.send();
		//console.log(request.responseText);
		var resp = await JSON.parse( request.responseText );
		//resp.data.transactions.edges.forEach(edge => document.write(edge.node.id + "<br>"));
		resp.data.transactions.edges.forEach(function(edge){ 
			var owner;
			var assetId;
			console.log( edge.node.tags );
			edge.node.tags.forEach(function(t){
				if( t.name === 'Input' ){
					owner = JSON.parse( t.value ).target;
				}
				if( t.name === 'Contract' ){
					assetId = t.value;
				}
			});
			if( !lastOwner[assetId] ){
				lastOwner[assetId] = owner;
			}
		});
		console.log( lastOwner );
		
		var galleryHtml = '';
		assets.forEach(function(asset){
			asset.owner = lastOwner[asset.id] ? lastOwner[asset.id] : asset.originalOwner;
			if( asset.owner === address ){
				//document.write( asset.id );
				var g = gstring.replace(/IMG/g,"https://arweave.net/" + asset.thumbId ).replace(/TITLE/g,asset.title).replace(/ASSETID/g,asset.id);
				//document.write( g );
				galleryHtml = galleryHtml + g;
			}
		});
		
		

		$("body").html( 
	      '<nav><div><a href="index.html"><img width="100%" src="./images/logo.svg"/></a></nav><div class="upload-container">  '
	      + '<h1 class="upload-header"> My Collection </h1>' 
	      + galleryHtml + '</div>'
	      );
		
}

      const arweave = Arweave.init({
        host: "arweave.net",
      });

      var address;
      var encrypted;
      var wallet;
      var aesKey;
      var artid;
      var thumbDataBlob;
      var thumbTx;
      var metaTx;
		var assets = [];
		var lastOwner = {};
		var contracts = {};
      arweave.network.getInfo().then(console.log);

      let smartweave = require("smartweave");


		// In this example we have an input file with the ID "keyfile"
		
		document.getElementById('keyfile').onchange = (ev) => {
	        const fileReader = new FileReader();
	        fileReader.onload = async (e) => {
		                        wallet = JSON.parse(e.target.result);
					address = await arweave.wallets.jwkToAddress(wallet);
		                     }
		          fileReader.readAsText(ev.target.files[0]);
		}



        async function doit() {
			
          arweave.wallets.getBalance(address).then((balance) => {
            let winston = balance;
            let ar = arweave.ar.winstonToAr(balance);

            console.log(winston);
            console.log(ar);

            console.log(
              "You are logged in with walletId " +
                address +
                " with " +
                ar +
                " ar!<br><br>"
            );
            getTheKey();
          });
        }

        $("#preview-file").hide();
        $("#uploadButton").on("click", function () {
          $("#preview-file").click();
        });

        $("#preview-file").change(function () {
          var file = this.files[0];
          var reader = new FileReader();
          reader.onloadend = function () {
            $("#imagePreview").css(
              "background-image",
              'url("' + reader.result + '")'
            );
          };
          if (file) {
            reader.readAsDataURL(file);
          } else {
          }
        });
        function readURL(input) {
          if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
              $("#image-preview,#darkblock-image").attr("src", e.target.result);
            };

            reader.readAsDataURL(input.files[0]);
          }
        }

        function sleep(ms) {
          return new Promise((resolve) => setTimeout(resolve, ms));
        }

        async function getTheKey() {
             $("body").append(
                '<div id="overlay">' +
                    '<div class="loading-container">' +
                  '<img id="loading" src="./images/loading.gif">' +
                  '</div>' +
                  '<div>' +
                  '<p class="loading-text">Generating encryption keys...</p>' +
                  '</div>' +
                  "</div>"
              );
              

          var request = new XMLHttpRequest();
          request.open(
            "GET",
            "https://dev1.darkblock.io/api/triggergeneration/" + address,
            false
          );
          request.send(null);

          console.log("1: " + request.responseText);
          await sleep(3000);
          var x = 0;
          for (;;) {
            var request2 = new XMLHttpRequest();
            var url = "https://dev1.darkblock.io/api/getartkey/" + address;
            console.log(url);
            request2.open("GET", url, false);
            request2.send(null);
            console.log("resp: (" + request2.responseText + ")");
            if (
              request2.responseText.indexOf("key") > 0 &&
              request2.responseText.indexOf("null") == -1
            ) {
              console.log("2: " + request2.responseText);
              const obj = JSON.parse(request2.responseText);
              aesKey = obj.key;
              artid = obj.artid;
              break;
            }
            await sleep(1000);
            x = x + 1;
            console.log("try " + x);
          }
          //       <nav>
          //   <div>
          //     <a href="index.html"
          //       ><img width="100%" src="./images/logo.svg" alt=""
          //     /></a>
          //   </div>
          //   <div class="nav-push">
          //     <a class="nav-link" href="index.html">Home</a>
          //     <a class="nav-link" href="/">Info</a>
          //     <a class="nav-link" href="/">Account</a>
          //     <a class="nav-link" href="/">Log Out</a>
          //   </div>
          // </nav>
          document.write("<nav>");
          document.write("<div>");
          document.write(
            '<a href="index.html"><img width="100%" src="./images/logo.svg"/></a>'
          );
          document.write("</nav>");

          // document.write( '<form>now encrypt a file: <input type="file" id="artfile"> <a id="encrypt" onclick="getThumbnail()"><br>getThumbnail!</a></form>' );
          document.write('<div class="upload-container">');
          document.write('<h1 class="upload-header">Create NFT</h1>');
          // image preview - coming back to it later
          //   document.write(
          //     '<form>Select art to upload: <input onchange="readURL(this);" type="file" id="previewfile"></form>'
          //   );
          //   document.write('<form><input id="preview-file" type="file"></form>');
          //   document.write('<div class="imagePreview" id="imagePreview"></div>');
          document.write("<div class=select-file>");
          document.write('<p class="upload-subheader">Upload file</p>');
          document.write('<form><input  type="file" id="artfile"></form>');
          document.write("<div  id=done></div>");
          document.write("</div>");
          document.write('<h1 class="upload-header">NFT Parameters</h1>');
          document.write(
            '<br><h1 class="input-title" >Name</h1><br><input autocomplete=off size=30 id=name placeholder="Title of artwork"><br><br>'
          );
          document.write(
            '<h1 class="input-title" >Description</h1><br><textarea id="description" placeholder="Describe your NFT" class=text-input cols=38 rows=1></textarea><br><br>'
          );
          document.write('<div class="custom-select">');
          document.write(
            "Creator royalties<br><select name=royalty id=royalty><br><br>"
          );
          document.write('<option value="0">No Royalty</option>');
          document.write('<option value="5">5%</option>');
          document.write('<option value="10">10%</option>');
          document.write('<option value="15">15%</option>');
          document.write('<option value="20">20%</option>');
          document.write("</select>");
          document.write("</div>");
          document.write(
            '<br><br><h1 id=test>Artist</h1><br><input autocomplete=off  size=30 id="artist" placeholder="Some Artist">'
          );
          document.write(
            "<br><br><input type=checkbox id=darkcheck>I would like to encrypt my high resolution art in a Darkblock"
          );
          document.write(
            "<br><br><input type=checkbox id=offset> I would like my NFT to offset its Carbon Footprint"
          );
          document.write("<br><br>Date Created <br><br>");
          document.write(
            '<input class="date-select" type="date" id="created" name="created" value=""><br><br>'
          );
          document.write(
            '<a class="encrypt-button" id="encrypt" onclick="uploadAll()">Encrypt my NFT</a>'
          );

          document.write("</div>");

          $(function () {
            $("body").on("click", "#encrypt", function (e) {
              e.preventDefault();

              $("body").append(
                '<div id="overlay">' +
                    '<div class="loading-container">' +
                  '<img id="loading" src="./images/loading.gif">' +
                  '</div>' +
                  '<div>' +
                  '<p class="loading-text">Encrypting your Masterpiece...</p>' +
                  '</div>' +
                  "</div>"
              );

              setTimeout(function () {
                $("#overlay").remove();
              }, 60000); //60 seconds
            });
          });

          var head = document.getElementsByTagName("HEAD")[0];

          // Create new link Element
          var link = document.createElement("link");

          // set the attributes for link element
          link.rel = "stylesheet";

          link.type = "text/css";

          link.href = "./css/main.css";

          // Append link element to HTML head
          head.appendChild(link);

          // image preview
          //   $("#preview-file").hide();
          //   $("#previewfile").on("click", function () {
          //     $("#preview-file").click();
          //   });

          //   $("#preview-file").change(function () {
          //     var file = this.files[0];
          //     var reader = new FileReader();
          //     reader.onloadend = function () {
          //       $("#imagePreview").css(
          //         "background-image",
          //         'url("' + reader.result + '")'
          //       );
          //     };
          //     if (file) {
          //       reader.readAsDataURL(file);
          //     } else {
          //     }
          //   });

          var x, i, j, l, ll, selElmnt, a, b, c;
          /*look for any elements with the class "custom-select":*/
          x = document.getElementsByClassName("custom-select");
          l = x.length;
          for (i = 0; i < l; i++) {
            selElmnt = x[i].getElementsByTagName("select")[0];
            ll = selElmnt.length;
            /*for each element, create a new DIV that will act as the selected item:*/
            a = document.createElement("DIV");
            a.setAttribute("class", "select-selected");
            a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
            x[i].appendChild(a);
            /*for each element, create a new DIV that will contain the option list:*/
            b = document.createElement("DIV");
            b.setAttribute("class", "select-items select-hide");
            for (j = 1; j < ll; j++) {
              /*for each option in the original select element,
    create a new DIV that will act as an option item:*/
              c = document.createElement("DIV");
              c.innerHTML = selElmnt.options[j].innerHTML;
              c.addEventListener("click", function (e) {
                /*when an item is clicked, update the original select box,
        and the selected item:*/
                var y, i, k, s, h, sl, yl;
                s = this.parentNode.parentNode.getElementsByTagName(
                  "select"
                )[0];
                sl = s.length;
                h = this.parentNode.previousSibling;
                for (i = 0; i < sl; i++) {
                  if (s.options[i].innerHTML == this.innerHTML) {
                    s.selectedIndex = i;
                    h.innerHTML = this.innerHTML;
                    y = this.parentNode.getElementsByClassName(
                      "same-as-selected"
                    );
                    yl = y.length;
                    for (k = 0; k < yl; k++) {
                      y[k].removeAttribute("class");
                    }
                    this.setAttribute("class", "same-as-selected");
                    break;
                  }
                }
                h.click();
              });
              b.appendChild(c);
            }
            x[i].appendChild(b);
            a.addEventListener("click", function (e) {
              /*when the select box is clicked, close any other select boxes,
      and open/close the current select box:*/
              e.stopPropagation();
              closeAllSelect(this);
              this.nextSibling.classList.toggle("select-hide");
              this.classList.toggle("select-arrow-active");
            });
          }
          function closeAllSelect(elmnt) {
            /*a function that will close all select boxes in the document,
  except the current select box:*/
            var x,
              y,
              i,
              xl,
              yl,
              arrNo = [];
            x = document.getElementsByClassName("select-items");
            y = document.getElementsByClassName("select-selected");
            xl = x.length;
            yl = y.length;
            for (i = 0; i < yl; i++) {
              if (elmnt == y[i]) {
                arrNo.push(i);
              } else {
                y[i].classList.remove("select-arrow-active");
              }
            }
            for (i = 0; i < xl; i++) {
              if (arrNo.indexOf(i)) {
                x[i].classList.add("select-hide");
              }
            }
          }
          /*if the user clicks anywhere outside the select box,
then close all select boxes:*/
          document.addEventListener("click", closeAllSelect);
        }

        async function uploadMeta() {
          console.log("uploading metadata");
          var meta = {
            name: document.getElementById("name").value,
            description: document.getElementById("description").value,
            artist: document.getElementById("artist").value,
            created: document.getElementById("created").value,
            royalty: document.getElementById("royalty").value,
          };
          console.log(meta);
          let transaction = await arweave.createTransaction(
            {
              data: JSON.stringify(meta),
            },
            wallet
          );
          transaction.addTag("artid", artid);
          transaction.addTag("asset-type", "metdata");
          transaction.addTag("Content-Type", "application/json");

          console.log("metadata transaction");
          console.log(transaction);

          await arweave.transactions.sign(transaction, wallet);

          console.log(transaction);

          let uploader = await arweave.transactions.getUploader(transaction);

          while (!uploader.isComplete) {
            await uploader.uploadChunk();
            console.log(
              `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
            );
          }
          console.log("metadata upload complete");
          metaTx = transaction.id;
        }

        async function upload(fileBytes) {
          let transaction = await arweave.createTransaction(
            {
              data: fileBytes,
            },
            wallet
          );

          //Verto NFT tags
          transaction.addTag("Exchange", "VertoTest");
          transaction.addTag("Action", "marketplace/Create");

          if (document.getElementById("darkcheck").checked) {
            transaction.addTag("Content-Type", "Encrypted");
            transaction.addTag("asset-type", "encrypted_original");
          } else {
            transaction.addTag("Content-Type", "image/jpeg");
            transaction.addTag("asset-type", "unencrypted");
          }

          //Darkblock tags
          transaction.addTag("thumbnail", thumbTx);
          transaction.addTag("metadata", metaTx);
          transaction.addTag("artid", artid);
          transaction.addTag("Uploading-App", "Darkblock");
          transaction.addTag("Creator", document.getElementById("artist").value);
          transaction.addTag("Title", document.getElementById("name").value);

          //smart contract tags
          transaction.addTag("App-Version", "0.3.0");
          transaction.addTag("App-Name", "SmartWeaveContract");
          transaction.addTag(
            "Contract-Src",
            "19KJrsgGk61wOrThQSwrVjsVhdXRIyFOogPGKMJ5YAo"
          );
          //need to sanitize this input, use JSON.stringify or whatevs
          transaction.addTag(
            "Init-State",
            '{"owner":"' +
              address +
              '","name":"' +
              document.getElementById("name").value +
              '","ticker":"DBK-Test","description":"' +
              document.getElementById("description").value +
              '", balance: {"' +
              address +
              '": 1}}'
          );

          console.log(transaction);

          await arweave.transactions.sign(transaction, wallet);

          console.log(transaction);

          let uploader = await arweave.transactions.getUploader(transaction);

          while (!uploader.isComplete) {
            await uploader.uploadChunk();
            console.log(
              `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
            );
          }
          console.log("upload complete");
	  	$("#overlay").remove();
	      
	      $("body").html( 
	      '<nav>        <div>            <a href="index.html"><img width="100%" src="./images/logo.svg" alt=""></a>        </div>        <div class="nav-push">            <a class="nav-link" href="index.html">Home</a>            <a class="nav-link" href="/">Info</a><a class="nav-link" href="/">Account</a><a class="nav-link" href="/">Log Out</a>       </div></nav><main><section class="hero"><div class="container"><h1 class="hero-text">Darkblock <br><span class="artist-portal">Upload Complete!</span></h1><div><a class="button button-dark" href="upload.html">Create another NFT</a><a class="button button-light" onclick=gallery()>View my NFTs</a></div></div>       </section>    </main>'
	      );
	  }

        async function uploadSmartContract() {
          //not used
          //createContract(arweave: Arweave, wallet: JWKInterface, contractSrc: string, initState: string, minFee?: number): Promise<string>
          //var ret = await smartweave.interactWrite( arweave, wallet, '19KJrsgGk61wOrThQSwrVjsVhdXRIyFOogPGKMJ5YAo', input, tags, target, '100' );

          console.log("upload smart contract: " + smartContract);
          //let transaction = await arweave.createTransaction({
          //data: smartContract
          //},wallet);
          //transaction.addTag('artid', artid);
          //transaction.addTag('App-Name', 'SmartWeaveContractSource');
          //transaction.addTag('App-Version', '0.3.0');
          //transaction.addTag('Content-Type', 'application/javascript');

          smartTx = await smartweave.createContractFromTx(
            arweave,
            wallet,
            smartContract,
            "19KJrsgGk61wOrThQSwrVjsVhdXRIyFOogPGKMJ5YAo",
            '{"owner":"' +
              address +
              '","name":"Testing Testing Testing","ticker":"DBK-Test","description":"Just testing things out for now."}'
          );

          console.log("smart contract transaction complete");
          console.log(smartTx);
        }

        async function uploadThumb() {
          console.log("upload thumb: " + thumbDataBlob);
          let transaction = await arweave.createTransaction(
            {
              data: thumbDataBlob,
            },
            wallet
          );
          transaction.addTag("artid", artid);
          transaction.addTag("asset-type", "thumbnail");
          transaction.addTag("Content-Type", "image/jpeg");

          console.log("thumbnail transaction");
          console.log(transaction);

          await arweave.transactions.sign(transaction, wallet);

          console.log(transaction);

          let uploader = await arweave.transactions.getUploader(transaction);

          while (!uploader.isComplete) {
            await uploader.uploadChunk();
            console.log(
              `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
            );
          }
          console.log("thumbnail upload complete");
          thumbTx = transaction.id;
        }

        async function uploadAll() {
          await getThumbnail();
          await uploadMeta();
          //await uploadSmartContract();
          window.scrollTo(0, 0);
          console.log("after getThumbnail: " + thumbDataBlob);

          var file = document.getElementById("artfile").files[0];
          console.log("got file of length " + file.size);

          var reader = new FileReader();
          if (document.getElementById("darkcheck").checked) {
            reader.onload = function (e) {
              encrypted = CryptoJS.AES.encrypt(e.target.result, aesKey);

              console.log("encrypted: " + encrypted);
              upload(encrypted + "");
            };
            reader.readAsDataURL(file);
          } else {
            var fileByteArray = [];
            reader.onloadend = function (e) {
              if (e.target.readyState == FileReader.DONE) {
                var arrayBuffer = e.target.result,
                  array = new Uint8Array(arrayBuffer);
                upload(arrayBuffer);
              }
            };
            reader.readAsArrayBuffer(file);
          }
        }


        /* Utility function to convert a canvas to a BLOB */
        var dataURLToBlob = function (dataURL) {
          var BASE64_MARKER = ";base64,";
          if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(",");
            var contentType = parts[0].split(":")[1];
            var raw = parts[1];

            return new Blob([raw], { type: contentType });
          }

          var parts = dataURL.split(BASE64_MARKER);
          var contentType = parts[0].split(":")[1];
          var raw = window.atob(parts[1]);
          var rawLength = raw.length;

          var uInt8Array = new Uint8Array(rawLength);

          for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
          }
          thumbDataBlob = uInt8Array;

          return new Blob([uInt8Array], { type: contentType });
        };
        /* End Utility function to convert a canvas to a BLOB      */

        async function getThumbnail() {
          var file = document.getElementById("artfile").files[0];

          // Ensure it's an image
          if (file.type.match(/image.*/)) {
            console.log("An image has been loaded");

            // Load the image
            var reader = new FileReader();
            reader.onload = await function (readerEvent) {
              var image = new Image();
              image.onload = function (imageEvent) {
                // Resize the image
                var canvas = document.createElement("canvas"),
                  max_size = 544, // TODO : pull max size from a site config
                  width = image.width,
                  height = image.height;
                if (width > height) {
                  if (width > max_size) {
                    height *= max_size / width;
                    width = max_size;
                  }
                } else {
                  if (height > max_size) {
                    width *= max_size / height;
                    height = max_size;
                  }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext("2d").drawImage(image, 0, 0, width, height);
                var dataUrl = canvas.toDataURL("image/jpeg");
                var resizedImage = dataURLToBlob(dataUrl);
                console.log("thumbnail:");
                console.log(resizedImage);
                //thumbDataBlob = resizedImage;
                console.log("thumb dataUrl: " + dataUrl);
                uploadThumb();
                $.event.trigger({
                  type: "imageResized",
                  blob: resizedImage,
                  url: dataUrl,
                });
              };
              image.src = readerEvent.target.result;
            };
            reader.readAsDataURL(file);
          }
        }

async function transferBox(txId){
     $("body").append(
    '<div id="overlay" style="height: 1200px;">' +
        '<div class="loading-container">' +
      //'<img id="loading" src="./images/loading.gif">' +
      '</div>' +
      '<div>' +
      '<p class="loading-text">Who would you like to transfer the art to?</p>' +
      'Address: <input size=50 id="target">' +
      '<input type=button onclick=\'transfer("' + txId + '")\' value="Transfer!">' +
      '</div>' +
      "</div>"
  );
}
async function transfer(txId){
	var target = document.getElementById("target").value; 
    console.log('target: ' + target);
	var input = { function: 'transfer', target: target };
	var tags = {};
	var ret = await smartweave.interactWrite( arweave, wallet, txId, input, tags, target, '100' );
	console.log( ret );
      $("body").append(
    '<div id="overlay" style="height: 1200px;">' +
        '<div class="loading-container">' +
      //'<img id="loading" src="./images/loading.gif">' +
      '</div>' +
      '<div>' +
      '<p class="loading-text">Transfer completed!</p>' +
      '<p><input type=button onclick=gallery() value="Back to my collection"></p>' +
      '</div>' +
      "</div>"
  );
} 
