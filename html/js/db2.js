
$(document).keyup(function(e) {
     if (e.key === "Escape") { // escape key maps to keycode `27`
	   console.log( "escape detected!" );
       gallery();
    }
});

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

  const arweave = Arweave.init({
    host: "arweave.net",
  });

  var address;
  var encrypted;
  var wallet;
  var aesKey;
  var artid;
  var thumbDataBlob;
  var metaTx;
  var dbTx;
  
	var assets = [];
	var lastOwner = {};
	var contracts = {};
  arweave.network.getInfo().then(console.log);

  let smartweave = require("smartweave");



        var $fileInput = $('.file-input');
var $droparea = $('.file-drop-area');

// highlight drag area
$fileInput.on('dragenter focus click', function() {
  $droparea.addClass('is-active');
});

// back to normal state
$fileInput.on('dragleave blur drop', function() {
  $droparea.removeClass('is-active');
});

// change inner text
$fileInput.on('change', function() {
  var filesCount = $(this)[0].files.length;
  var $textContainer = $(this).prev();

  if (filesCount === 1) {
    // if single file is selected, show file name
    var fileName = $(this).val().split('\\').pop();
    $textContainer.text(fileName);
  } else {
    // otherwise show number of files
    $textContainer.text(filesCount + ' files selected');
  }
});



	// In this example we have an input file with the ID "keyfile"
	
	document.getElementById('keyfile').onchange = (ev) => {
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
	                        wallet = JSON.parse(e.target.result);
				address = await arweave.wallets.jwkToAddress(wallet);
	                     }
	          fileReader.readAsText(ev.target.files[0]);
	}
		

async function gallery(){
	assetQuery('query {  transactions(first: 500,    tags: { name: \"Asset-Type\", values: [\"NFT\"] }  ) {    edges {      node {        id tags { name value }      }    }  }}');
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
				try{
					if( t.name === 'Init-State' ){
						console.log( edge.node.id + " : " + t.value );
						edge.node['originalOwner'] = t.value.split('"')[15];//terrible. can't get the json to parse for some reason'
						edge.node.title = JSON.parse( t.value ).name;
					}
				}
				catch(e){
					//bad data
				}
			});
			assets.push( edge.node );

		});
		console.log( contracts );

		var contractString = '"' + Object.values(contracts).join('","') + '"';
		//console.log( contractString );
		await stateQuery('query {  transactions(first: 500,    tags: { name: "Contract", values: [' + contractString + '] }  ) {    edges {      node {        id tags { name value }      }    }  }}');
}
//var gstring = '<center><div class="gal" style="width:600px;margin-bottom: 50px;"><a target="_blank" href="IMG"><img src="IMG" alt="TITLE" style="width:600px;"></a><div class="desc">TITLE - <input type=button value=transfer onclick=transferBox(\'ASSETID\')></div></div><br><br></center>';
var gstring = '<div class="gal" style="margin-bottom: 50px;"><a target="_blank" href="IMG"><img src="IMG" alt="TITLE"></a><div class="desc"><p class="input-title">TITLE</p> </div><input class=transfer-button type=button value=Transfer onclick=transferBox(\'ASSETID\')></div>';
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
				var g = gstring.replace(/IMG/g,"https://arweave.net/" + asset.id ).replace(/TITLE/g,asset.title).replace(/ASSETID/g,asset.id);
				//document.write( g );
				galleryHtml = galleryHtml + g;
			}
		});
		
		

        $("body").html(
          '<nav><div><a href="index.html"><img width="100%" src="./images/logo.svg"/></a></nav><div class="upload-container">  ' +
            '<h1 style="margin-top:100px;" class="upload-header"> My Collection </h1>' +
            "<div class=gallery-grid>" +
            galleryHtml +
            "</div>" +
            "</div>"
        );
		
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
          await sleep(1000);
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
            document.write(
            '<h1 style="margin-top:80px;" class="upload-header">Create a Darkblock enabled NFT</h1>'
          );
          // image preview - coming back to it later
          //   document.write(
          //     '<form>Select art to upload: <input onchange="readURL(this);" type="file" id="previewfile"></form>'
          //   );
          //   document.write('<form><input id="preview-file" type="file"></form>');
          //   document.write('<div class="imagePreview" id="imagePreview"></div>');
          
          document.write("<div class=select-file>");
          document.write('<div class="preview-container hi-res">');
          document.write(
            '<p class="upload-subheader">Upload Hi-Res File</p>'
          );
          document.write(
            '<form><input  class="custom-file-input" accept="image/*" type="file" id="artfile"></form>'
          );
          document.write(
            '<img  class="preview-img" id="blah" src="" alt="Darkblock File" />'
          );
          document.write("</div>");
          document.write('<div class="preview-container">');
          document.write('<p class="upload-subheader">Upload Preview File</p>');
          document.write(
            '<form><input class="custom-file-input" id="previewfile" accept="image/*" onchange="loadFile(event)" type="file"></form>'
          );
          document.write(
            '<img onerror="hideImg()" onload="imgAppear()" class="preview-img" id="output" src="" alt="Preview Image" />'
          );
          document.write("</div>");
          document.write("<div  id=done></div>");
          document.write("</div>");
          // document.write('<h1 class="upload-header">NFT Parameters</h1>');
          document.write('<div style="display:flex;margin-top:40px;">');
          document.write('<div style="margin-right:15px;">');
          document.write(
            '<h1 class="input-title" >Name</h1><input autocomplete=off size=30 id=name placeholder="Title of artwork">'
          );
          document.write("</div>");
          document.write('<div style="margin-left:15px;">');
          document.write(
            '<h1 class="input-title" >Description</h1><textarea id="description" placeholder="Describe your NFT" class=text-input cols=38 rows=1></textarea>'
          );
          document.write("</div>");
          document.write("</div>");
          document.write('<div  style="display:flex;margin-top:40px;">');
          document.write("<div style=margin-right:35px;>");
          document.write('<div class="custom-select">');

          document.write(
            "<h1 class=input-title > Creator royalties</h1><select name=royalty id=royalty><br><br>"
          );
          document.write('<option value="0">No Royalty</option>');
          document.write('<option value="0">No Royalty</option>');
          document.write('<option value="5">5%</option>');
          document.write('<option value="10">10%</option>');
          document.write('<option value="15">15%</option>');
          document.write('<option value="20">20%</option>');
          document.write("</select>");
          document.write("</div>");
          document.write("</div>");
          document.write("<div style=margin-left:35px;>");
          document.write(
            '<h1 class="input-title">Artist</h1><input autocomplete=off  size=30 id="artist" placeholder="Who are you?">'
          );
          document.write("</div>");
          document.write("</div>");
          document.write("<div style=margin-bottom:40px;>");
          document.write('<div style="display:flex;margin-top:-10px;">');
//          document.write('<div style="margin-right:15px;">');
//          document.write(
//            '<h1 class="input-title" >Price</h1><textarea id="price" placeholder="Price of the art, in AR." class=text-input cols=38 rows=1></textarea>'
            //'<h1 class="input-title" >Number of Prints</h1><input autocomplete=off size=30 id=printcount placeholder="How many editions can people buy?" value=1>'
//          );
//          document.write("</div>");
          document.write('<div style="margin-right:82px; margin-top: -10px;">');
          document.write('<h1 class="input-title">Date Created</h1>');
          document.write(
            '<input class="date-select" type="date" id="created" name="created" value="">'
          );
          document.write("</div>");
          
          document.write('<div style="margin-left:15px;">');
          document.write(
            '<h1 class="input-title" >Number of Prints</h1><textarea id="printcount" placeholder="How many people can buy the NFT." class=text-input cols=38 rows=1>1</textarea>'
            //'<h1 class="input-title" >Number of Prints</h1><input autocomplete=off size=30 id=printcount placeholder="How many editions can people buy?" value=1>'
          );
          document.write("</div>");
          
          document.write('</div>');
          

          

          
          document.write('<div>');
          document.write(
            "<input type=checkbox id=royalty>I would like my NFT to offset its Carbon Footprint"
          );
          document.write('</div>');
          document.write("</div>");
          document.write(
            '<a class="encrypt-button" id="encrypt" onclick="uploadAll()">Create my NFT</a>'
          );

          document.write("</div>");

          $(function () {
            $("body").on("click", "#encrypt", function (e) {
              e.preventDefault();

              $("body").append(
                '<div id="overlay">' +
                  '<div class="loading-container">' +
                  '<img id="loading" src="./images/loading.gif">' +
                  "</div>" +
                  "<div>" +
                  '<p class="loading-text">Encrypting your Masterpiece...</p>' +
                  "</div>" +
                  "</div>"
              );

              setTimeout(function () {
                $("#overlay").remove();
              }, 50000); //5 seconds
            });
          });

          function readURL(input) {
            if (input.files && input.files[0]) {
              var reader = new FileReader();

              reader.onload = function (e) {
                $("#blah").attr("src", e.target.result);
              };

              reader.readAsDataURL(input.files[0]);
            }
          }

          $("#artfile").change(function () {
            readURL(this);
          });


          // function readURL(input,x) {
          //         if (input.files && input.files[0]) {
          //             var reader = new FileReader();
          //             x = '#'+x;
          //             reader.onload = function (e) {
          //                 $(x)
          //                     .attr('src', e.target.result)
          //                     .width(150)
          //                     .height(200);
          //             };
          //             reader.readAsDataURL(input.files[0]);
          //         }
          //     }

          // function readURL(input) {
          //     if (input.files && input.files[0]) {
          //         var reader = new FileReader();

          //         reader.onload = function (e) {
          //             $('#blahtwo').attr('src', e.target.result);
          //         }

          //         reader.readAsDataURL(input.files[0]);
          //     }
          // }

          // $("#nftpreview").change(function(){
          //     readURL(this);
          // });

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
          transaction.addTag("Artid", artid);
          transaction.addTag("Asset-Type", "metadata");
          transaction.addTag("Content-Type", "application/json");
          transaction.addTag("Uploading-App", "Darkblock");

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

        async function upload() {
          let transaction = await arweave.createTransaction(
            {
              data: thumbDataBlob,
            },
            wallet
          );
          
          //content tag
          transaction.addTag("Content-Type", "image/jpeg");

          //Verto NFT tags
          transaction.addTag("Exchange", "Verto");
          transaction.addTag("Action", "marketplace/Create");

          //Darkblock tags
          transaction.addTag("Asset-Type", "NFT");
          transaction.addTag("Darkblock", dbTx);
          transaction.addTag("Metadata", metaTx);
          transaction.addTag("Artid", artid);
          transaction.addTag("Uploading-App", "Darkblock");
          transaction.addTag("Creator", document.getElementById("artist").value);

          //smart contract tags
          transaction.addTag("App-Version", "0.3.0");
          transaction.addTag("App-Name", "SmartWeaveContract");
          transaction.addTag(
            "Contract-Src",
            //"19KJrsgGk61wOrThQSwrVjsVhdXRIyFOogPGKMJ5YAo"
            "ngMml4jmlxu0umpiQCsHgPX2pb_Yz6YDB8f7G6j-tpI"//1111's borrowed community.xyz contract
          );
          //need to sanitize this input, use JSON.stringify or whatevs
          transaction.addTag(
            "Init-State",
            '{"name":"' + document.getElementById("name").value + '","ticker":"DARK-' + Math.floor(Math.random() * 10000) + '","description":"' +
              document.getElementById("description").value + '", "balances":{"' + address + '":' + document.getElementById('printcount').value + '},"vault":{},"votes":[],"roles":{},"settings":[["quorum",0.5],["support",0.5],["voteLength",2160],["lockMinLength",21600],["lockMaxLength",262800]]}'
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

        
        async function uploadDarkBlock(arrayBuffer) {
          console.log("uploading darkblock ");
          let transaction = await arweave.createTransaction(
            {
              data: arrayBuffer,
            },
            wallet
          );
          transaction.addTag("Artid", artid);
          transaction.addTag("Asset-Type", "darkblock");
          transaction.addTag("Uploading-App", "Darkblock");
          transaction.addTag("Content-Type", "Encrypted");

          console.log("darkblock transaction");

          await arweave.transactions.sign(transaction, wallet);
          console.log(transaction);


          let uploader = await arweave.transactions.getUploader(transaction);

          while (!uploader.isComplete) {
            await uploader.uploadChunk();
            console.log(
              `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
            );
          }
          console.log("darkblock upload complete");
          dbTx = transaction.id;
          upload();
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
          reader.onload = function (e) {
          	encrypted = CryptoJS.AES.encrypt(e.target.result, aesKey);

            console.log("encrypted: " + encrypted);
            uploadDarkBlock(encrypted + "");
          };
          reader.readAsDataURL(file);
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
        }
        /* End Utility function to convert a canvas to a BLOB      */

        async function getThumbnail() {
		  var file; 
		  if( document.getElementById("previewfile").files ){
          	file = document.getElementById("previewfile").files[0];
          }
          else{
			file = document.getElementById("artfile").files[0];
		  }

          // Ensure it's an image
          if (file.type.match(/image.*/)) {
            console.log("An image has been loaded");

            // Load the image
            var reader = new FileReader();
            reader.onload = function (readerEvent) {
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

function hideImg() {
  document.getElementById("output").style.outline = "0";
 }
var loadFile = function (event) {
  var output = document.getElementById("output");
  output.src = URL.createObjectURL(event.target.files[0]);
  output.onload = function () {
    URL.revokeObjectURL(output.src); // free memory
  };
};

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
	var input = { function: 'transfer', target: target, qty: 1 };
	var tags = { };// could use this to mark it, but the exchange won't do this... '"Uploading-App": "Darkblock", "Asset-Type": "transfer", "Target": target };
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
