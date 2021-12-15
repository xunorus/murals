/*****
CRYPTOMURALS
Cryptourals is an NFT marketplace for artists related to cryptomurals...
Release under MIT License by Xunorus, 2021
http://xunorus.com
*****/

const Toast = Swal.mixin({
  toast: true,
  position: "top-right",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: toast => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  }
});

const fixedToast = swal.mixin({
  toast: true,
  position: "top-left",
  showConfirmButton: false,
  showConfirmButton: true
});




/*********************************************************************************************
.) MORALIS (for loggin and other quickfixes)
**********************************************************************************************/

// 0. Check moralis
const serverUrl = "https://hyorvrgxcdmm.usemoralis.com:2053/server";
const appId = "Lx28OvD1jYsfl8Q52brKgUbJ1yGP9kWgffDg2hrU";
// Moralis.start({ serverUrl, appId });


const init = async () => {
await Moralis.start({
  appId : appId,
  serverUrl: serverUrl
});
Moralis.initPlugins();
};

init();

/*********************************************************************************************
.) LOGG stuff
**********************************************************************************************/

//  LOGIN
async function login() {
  console.log('login tryied');
  let user = Moralis.User.current();
  if (!user) {
    try {
      let user = await Moralis.authenticate({
        signingMessage: "Hello from cryoptomurals!"
      })
      let userAddress = user.get('ethAddress');

      var x = userAddress;
      var shortAddr = x.substring(0, 8) + "...";
      document.getElementById("logg").innerHTML = "<p class='loged btn-grad-inv'>" + shortAddr + " <i class='logout fa fa-sign-out' aria-hidden='true' onclick='event.stopPropagation();logOut()'></i> </p> <p style='display:none' class='responsiveloged btn-grad-inv'> <i class='logout fa fa-sign-out' aria-hidden='true' onclick='event.stopPropagation();logOut()'></i> </p>";

      console.log('User address: ', userAddress);

    } catch (error) {
      console.log(error)
    }
  } else {
    console.log('user is already here...');
    Moralis.enableWeb3(); //if user has a sesion authenticate is not called so metamaks is not initiated, here we fix this
    let userAddress = user.get('ethAddress');
    var x = userAddress;
    var shortAddr = x.substring(0, 8) + "...";
    // document.getElementById("logg").innerHTML = "<p class='loged btn-grad-inv'>" + shortAddr + " <i class='logout fa fa-sign-out' aria-hidden='true' onclick='event.stopPropagation();logOut()'></i> </p>";
    document.getElementById("logg").innerHTML = "<p class='loged btn-grad-inv'>" + shortAddr + " <i class='logout fa fa-sign-out' aria-hidden='true' onclick='event.stopPropagation();logOut()'></i> </p> <p style='display:none' class='responsiveloged btn-grad-inv'> <i class='logout fa fa-sign-out' aria-hidden='true' onclick='event.stopPropagation();logOut()'></i> </p>";

  }
}

// LOGOUT
async function logOut() {
  await Moralis.User.logOut();
  document.getElementById("logg").innerHTML = `<button  class="btn-grad"   onclick="login();">Connect</button>`;

  console.log("logged out");
}


/*********************************************************************************************
.) GET OWNER (hack with moralis)
**********************************************************************************************/
async function getOwner(id, divid) {
  console.log('input', id, divid);
  const options = {
    address: TOKEN_CONTRACT_ADDRESS,
    token_id: id,
    chain: CHAIN
  };
  const ownrs = await Moralis.Web3API.token.getTokenIdOwners(options)
  // const ownrs =   Moralis.Web3API.token.getTokenIdOwners(options)
  // Moralis.Web3API.token.getTokenIdOwners(options)
  console.log('owner: ', ownrs.result[0].owner_of);
  console.log('owners amount: ', ownrs.result[0].amount);

  setTimeout(() => {
    // document.getElementById("preview-" + id).innerHTML += `<p  onclick="owner();" class="owner btn-grad">OWNER: ${ownrs.result[0].owner_of}</p>`
    document.getElementById("preview-" + id).innerHTML += `<p  onclick="owner();" class="owner btn-grad">OWNER: ${ownrs.result[0].owner_of}<br>Total Owners: ${ownrs.result[0].amount}</p>`;
  }, 3000);


  return ownrs
}


/*********************************************************************************************
   .) GET NFTs  with covalent
  //  https://deep-index.moralis.io/api/v2/nft/0x7C64C82798a355DA6ced94642960A7F11C07A05a/398885296004351450167?chain=polygon&format=decimal

   **********************************************************************************************/




/*********************************************************************************************
 .) NFTPORT 
**********************************************************************************************/
////////////////////////////////////////
// retriebe all nfts per contract
const NFTPORT_KEY = '524a1fad-f13f-4317-8ad0-0e75e45d4b61';
const CHAIN = "polygon";

const TOKEN_CONTRACT_ADDRESS = "0x7C64C82798a355DA6ced94642960A7F11C07A05a"; // creado con nftport para FINAL. owner xun

const parent = document.getElementById("inventory");
const insideContent = document.getElementById("overlay");

// RETRIEVE NFTs
const settings = {
  "async": true,
  "crossDomain": true,
  "url": `https://api.nftport.xyz/v0/nfts/${TOKEN_CONTRACT_ADDRESS}?chain=${CHAIN}`,
  "method": "GET",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": `${NFTPORT_KEY}`
  }
};

$.ajax(settings).done(function (response) {
  console.log('TOTAL NFTs: ', response.nfts.length);
  console.log('nft info:', response);

  // LOOP EACH NFT
  for (var i = 0; i < response.nfts.length; i++) {
    let token = response.nfts[i].token_id,
      caddr = response.nfts[i].contract_address,
      chain = response.nfts[i].chain;



    // API call: retriebe NFT's metadata 
    const settings = {
      "async": true,
      "crossDomain": true,
      "url": `https://api.nftport.xyz/v0/nfts/${caddr}/${token}?chain=${chain}&refresh_metadata=true`, // refreshing_metadata
      "method": "GET",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": `${NFTPORT_KEY}`
      }
    };

    $.ajax(settings).done(function (x) {
      console.log('x: ', x)
      let name = x.nft.metadata.name;
      let description = x.nft.metadata.description;
      let image = x.nft.metadata.image;
      // let image = x.nft.cached_file_url; // cached file, recommended byNiladri | Data Scientist@NFTPort
      let token = x.nft.token_id;
      let contract = x.nft.contract_address;
      let chain = x.nft.chain;
      
      // MAINSCREEN ( NFT as displayed on main screen)
      let htmlString = ` 
      <div class="box"> 
        <div class="box__shadow"></div> 
        <img class="box__img" src="${image}" alt="Some image"/> 
        <h3 class="box__title"><span class="box__title-inner" data-hover="${name}">${name}</span></h3> 
        <h4 class="box__text"><span class="box__text-inner">${chain}</span></h4>
        <div style='display:none' class="box__deco">&#10032;</div> 
        <p class="box__content">${description} <br> </p> 
      </div> `
      let col = document.createElement("a");
      col.className = "grid__item";
      col.href = "#preview-" + `${token}`;
      col.id = `${token}`; //truco poner el nftId en el id del item (a tag)
      col.innerHTML = htmlString;
      parent.appendChild(col);

      // OVERLAY (screen showed when click on NFT)
      let htmlStringOverlay = ` 
      <div class="box">
        <div class="box__shadow"></div>
        <img class="box__img box__img--original" src="${image}" alt="Some image"/> 
        <h4 class="box__text box__text--bottom"><span class="box__text-inner box__text-inner--rotated1">id:${token}</span></h4> 
      </div> 
      <div  class="overlay__content"> 
        <h3 class="box__title box__title--straight box__title--bottom"><span class="box__title-inner">${name}</span></h3>
        <p class="box__content">${description} <br><br>
          <a target="_blank" href=" https://maps.google.com/?q=${x.nft.metadata.geoInfo}">GeoInfo</a><br><br>
          <a target="_blank" href="${x.nft.metadata.video}">Video</a><br><br>
          <a target="_blank" href="${x.nft.metadata.qrLink}">Experience</a><br><br>
        </p>
     <p id='${token}' > </p> 
     </div> 
    <div class="wrapper" onclick="event.stopPropagation();initBuy();"> <a class="cta" href="#"> 
    <span>BID</span> 
    <span> <svg width="66px" height="43px" viewBox="0 0 66 43" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <g id="arrow" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <path class="one" d="M40.1543933,3.89485454 L43.9763149,0.139296592 C44.1708311,-0.0518420739 44.4826329,-0.0518571125 44.6771675,0.139262789 L65.6916134,20.7848311 C66.0855801,21.1718824 66.0911863,21.8050225 65.704135,22.1989893 C65.7000188,22.2031791 65.6958657,22.2073326 65.6916762,22.2114492 L44.677098,42.8607841 C44.4825957,43.0519059 44.1708242,43.0519358 43.9762853,42.8608513 L40.1545186,39.1069479 C39.9575152,38.9134427 39.9546793,38.5968729 40.1481845,38.3998695 C40.1502893,38.3977268 40.1524132,38.395603 40.1545562,38.3934985 L56.9937789,21.8567812 C57.1908028,21.6632968 57.193672,21.3467273 57.0001876,21.1497035 C56.9980647,21.1475418 56.9959223,21.1453995 56.9937605,21.1432767 L40.1545208,4.60825197 C39.9574869,4.41477773 39.9546013,4.09820839 40.1480756,3.90117456 C40.1501626,3.89904911 40.1522686,3.89694235 40.1543933,3.89485454 Z" fill="#FFFFFF"></path> <path class="two" d="M20.1543933,3.89485454 L23.9763149,0.139296592 C24.1708311,-0.0518420739 24.4826329,-0.0518571125 24.6771675,0.139262789 L45.6916134,20.7848311 C46.0855801,21.1718824 46.0911863,21.8050225 45.704135,22.1989893 C45.7000188,22.2031791 45.6958657,22.2073326 45.6916762,22.2114492 L24.677098,42.8607841 C24.4825957,43.0519059 24.1708242,43.0519358 23.9762853,42.8608513 L20.1545186,39.1069479 C19.9575152,38.9134427 19.9546793,38.5968729 20.1481845,38.3998695 C20.1502893,38.3977268 20.1524132,38.395603 20.1545562,38.3934985 L36.9937789,21.8567812 C37.1908028,21.6632968 37.193672,21.3467273 37.0001876,21.1497035 C36.9980647,21.1475418 36.9959223,21.1453995 36.9937605,21.1432767 L20.1545208,4.60825197 C19.9574869,4.41477773 19.9546013,4.09820839 20.1480756,3.90117456 C20.1501626,3.89904911 20.1522686,3.89694235 20.1543933,3.89485454 Z" fill="#FFFFFF"></path> <path class="three" d="M0.154393339,3.89485454 L3.97631488,0.139296592 C4.17083111,-0.0518420739 4.48263286,-0.0518571125 4.67716753,0.139262789 L25.6916134,20.7848311 C26.0855801,21.1718824 26.0911863,21.8050225 25.704135,22.1989893 C25.7000188,22.2031791 25.6958657,22.2073326 25.6916762,22.2114492 L4.67709797,42.8607841 C4.48259567,43.0519059 4.17082418,43.0519358 3.97628526,42.8608513 L0.154518591,39.1069479 C-0.0424848215,38.9134427 -0.0453206733,38.5968729 0.148184538,38.3998695 C0.150289256,38.3977268 0.152413239,38.395603 0.154556228,38.3934985 L16.9937789,21.8567812 C17.1908028,21.6632968 17.193672,21.3467273 17.0001876,21.1497035 C16.9980647,21.1475418 16.9959223,21.1453995 16.9937605,21.1432767 L0.15452076,4.60825197 C-0.0425130651,4.41477773 -0.0453986756,4.09820839 0.148075568,3.90117456 C0.150162624,3.89904911 0.152268631,3.89694235 0.154393339,3.89485454 Z" fill="#FFFFFF"></path> </g> </svg> </span> </a> 
    <div class='actions'> 
    <button  onclick="event.stopPropagation();initUpdaterModal();"  ><span>Update</span> </button> 
    <button  onclick="event.stopPropagation();initTransferModal();" > <span>Transfer</span>  </button> 
    <button  onclick="event.stopPropagation();initBurnerModal();" > <span>Burn</span>  </button> </div> </div> `
      let overlay = document.createElement("div");
      overlay.className = "overlay__item";
      overlay.id = "preview-" + `${token}`;
      overlay.innerHTML = htmlStringOverlay;
      insideContent.appendChild(overlay);
      // console.log('parece que cargo todo');
      iniciar(); // starts demo.js
    });

    // GET OWNER (hack)
    console.log('tokenid', token);
    getOwner(token, token);


  }
});


/*********************************************************************************************
 .) INITIALIZE DAPP
**********************************************************************************************/

// initializeApp();

async function initializeApp() {
  console.log("iniciar has benn triggered");

  // INICIA USUARIO
  if (typeof web3 !== "undefined") {
    console.log("1- web3 is enabled");

    document.getElementById("logg").innerHTML = `<button id="login" onclick="login();" class="btn-grad">CONNECT</button>`

    let user = Moralis.User.current();
    if (!user) {
      console.log(' user is not logged but we do nothing ;) ');

    } else {
      console.log('user is already here...');
      Moralis.enableWeb3(); //if user has a sesion authenticate is not called so metamaks is not initiated, here we fix this
      let userAddress = user.get('ethAddress');
      var x = userAddress;
      var shortAddr = x.substring(0, 8) + "...";
      document.getElementById("logg").innerHTML = "<p class='loged btn-grad-inv'>" + shortAddr + " <i class='logout fa fa-sign-out' aria-hidden='true' onclick='event.stopPropagation();logOut()'></i> </p>";

      // document.getElementById("logg").innerHTML = "<p class='loged btn-grad-inv'>" + userAddress + " <i class='logout fa fa-sign-out' aria-hidden='true' onclick='event.stopPropagation();logOut()'></i> </p>";

    }




  } else {
    console.log("web3 is not found");
    // noWeb3();
    Swal.fire({
      title: "web3 is not found",
      icon: "info",
      html: 'A web3 enabled browser is needed to use Cryptomurals. ' + '.',
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: '<i class="fa fa-thumbs-up"></i> OK',
      confirmButtonAriaLabel: "Thumbs up, great!"
    });
  }
}


initializeApp();


/*********************************************************************************************
.) NAVBAR
**********************************************************************************************/
var navb = document.getElementById('button');
var sideBar = document.getElementById('sideBar');
var content = document.getElementById('main');
navb.onclick = navbar;

function navbar() {
  if (navb.classList.contains('is-active')) { // if user is no defined
    console.log('CIERRA');
    navb.classList.remove('is-active');
    sideBar.classList.remove('isOpen');
    content.classList.remove('isOpen');

    TweenMax.to(".nav", 0.5, {
      xPercent: -100,
      display: 'none',
      ease: Expo.easeOut
    });
    window.removeEventListener("click", listener, false);

  } else {
    console.log('ABRE');
    navb.classList.add('is-active');
    sideBar.classList.add('isOpen');
    content.classList.add('isOpen');
    TweenMax.fromTo(".nav", 0.5, {
      xPercent: -100
    }, {
      xPercent: 0,
      display: 'block',
      ease: Expo.easeOut
    });
    TweenMax.staggerFrom('.nav li', 0.5, {
      opacity: 0,
      y: 20,
      ease: Power2.easeInOut
    }, 0.1);
    setTimeout(() => {
      window.addEventListener("click", listener, false);
    }, 100);

  }
}

function listener(e) {
  if (sideBar.contains(e.target)) {
    console.log("clicked A Inside" + e.target);
  } else {
    console.log("clicked B outside" + e.target);
    navb.classList.remove('is-active');
    sideBar.classList.remove('isOpen');
    content.classList.remove('isOpen');
    TweenMax.to(".nav", 0.5, {
      xPercent: -100,
      display: 'none',
      ease: Expo.easeOut
    });
    window.removeEventListener("click", listener, false);
  }
}


/*********************************************************************************************
.) MODALS
**********************************************************************************************/

//////////////////////////
// CLOSE MODAL
let closeModal = document.getElementsByClassName("closeModal");
for (i = 0; i < closeModal.length; i++) {
  closeModal[i].onclick = function () {
    updaterModal.style.display = "none";
    minterModal.style.display = "none";
    transferModal.style.display = "none";
    burnerModal.style.display = "none";

  };
}
////////////////////////////////////////////////////////////////////////////////////////////
// UPDATE NFT
function initUpdaterModal() {
  updaterModal.style.display = "block";
  console.log('showing modal');

  /// just for test prefill inputs
  // document.getElementById('nftName').value = 'DFACEETHBLOBAL v2';
  document.getElementById('nftDesc').value = 'NAME OF THE PAINT: Motion design by @serial_looper. When you buy this NFT you support 4 parts: The artist, the motion designer, the festival and the murals project';
  document.getElementById('vidLink').value = 'ipfs://QmcsbvqYChx6M61jKANFsQZneE2mR5tb5cDjG8MbgVYTHA';
  document.getElementById('geoInfo').value = '48.83258258297137, 2.3616745019412626';
  document.getElementById('qrlink').value = 'https://rdsb.link/r/600a4699ad532';

    //check user if is owner of the contract or has admin rights
    // let user = Moralis.User.current();
    // if (!user) {
    //   Swal.fire('Connect!', 'you have to connect your wallet to perform this action!', 'info');
    //   console.log('User address: ', userAddress)
    // }


  const urlParams = new URLSearchParams(window.location.search);
  const nftId = urlParams.get("nftId");
  console.log('nftId:', nftId);
  document.getElementById("input_tokenid").value = nftId; //populate input
  document.getElementById("input_tokencontract").value = TOKEN_CONTRACT_ADDRESS; //populate input
  // document.getElementById("address_input").value = user.get("ethAddress"); //populate address

}


// UPLOADE IMAGE
var fakeBut = document.getElementById('file-button'),
    realInput = document.getElementById('nftimg');

fakeBut.addEventListener('click', function(e) {
    realInput.click();
});


async function updateNFT() {
  console.log('submit clicked');

  //check user is connected
  let user = Moralis.User.current();
  if (!user) {
    Swal.fire('Connect!', 'you have to connect your wallet to perform this action!', 'info');
    console.log('User address: ', userAddress)
  }

  // check all fields are compelted
  if (nftName.value.length == 0) {
    alert("Please this NFT a name");
    return;
  } else if (nftDesc.value.length == 0) {
    alert("Please enter a description");
    return;
  } else if (nftimg.files.length == 0) {
    alert("Please upload an image for this NFT");
    return;
  } else if (vidLink.value.length == 0) {
    alert("Please enter a video link");
    return;
  } else if (geoInfo.value.length == 0) {
    alert("Please geo coordinates like: [83258258297137, 2.3616745019412626]");
    return;
  } else if (qrlink.value.length == 0) {
    alert("Please enter the qr link for this experience");
    return;
  }




  //get image data
  // const input = document.querySelector('#nftimg');
  let data = nftimg.files[0];

  // upload image to ipfs
  // https://docs.nftport.xyz/docs/nftport/b3A6MjE0MDYzNzY-upload-a-file-to-ipfs
  const imageFile = new Moralis.File(data.name, data);
  await imageFile.saveIPFS();
  let imageHash = imageFile.hash();
  console.log(imageHash);
  //  let imageLink = "ipfs://" + imageHash;
  //  let imageLinknftport = "/ipfs/" + imageHash;
  let imageLink = "https://ipfs.io/ipfs/" + imageHash;

  // SHOW OPERATION DETAILS;
  document.querySelector('#success_message').innerHTML += `File uploaded to IPFS:<i class="fa fa-check" aria-hidden="true"></i><br> ${imageLink} .<br> <a target="_blank" href="${imageLink}">view FILE</a><br><br>`;
  document.querySelector('#success_message').style.display = 'block';

  // CONTINUE TO UPLOAD METADATA
  let metadata = {
    name: nftName.value,
    description: nftDesc.value,
    image: imageLink,
    video: vidLink.value,
    geoInfo: geoInfo.value,
    qrLink: qrlink.value
  };

  console.log('metadata: ', metadata);


  // UPLOAD METADATA TO IPFS
  const jsonFile = new Moralis.File('metadata.json', {
    base64: btoa(JSON.stringify(metadata))
  });
  await jsonFile.saveIPFS();
  let metadataHash = jsonFile.hash();
  console.log('metadataHash: ', metadataHash);
  // let metadataLink = "ipfs://" + metadataHash;
  // let metadataLinknftport = "/ipfs/" + metadataHash;
  let metadataLink = "https://ipfs.io/ipfs/" + metadataHash;
  console.log('metadataLink: ',metadataLink);

  // SHOW OPERATION DETAILS;
  document.querySelector('#success_message').innerHTML += `Metadata uploaded to IPFS:<i class="fa fa-check" aria-hidden="true"></i><br> ${metadataLink} .<br> <a target="_blank" href="${metadataLink}">view METADATA</a>`;



//  MINT UPDATER
  // const NFTPORT_KEY = '524a1fad-f13f-4317-8ad0-0e75e45d4b61';
  // const CHAIN = "polygon";

  const UPDATE_CONTRACT_ADDRESS = document.getElementById('input_tokencontract').value;
  const UPDATE_TOKEN_ID = document.getElementById('input_tokenid').value;

  const settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://api.nftport.xyz/v0/mints/customizable",
    "method": "PUT",
    "headers": {
      "Content-Type": "",
      "Authorization": `${NFTPORT_KEY}`
    },
    "processData": false,
    "data": `{\n  \"chain\": \"${CHAIN}\",\n  \"contract_address\": \"${UPDATE_CONTRACT_ADDRESS}\",\n  \"token_id\": \"${UPDATE_TOKEN_ID}\",\n  \"metadata_uri\": \"${metadataLink}\"\n}`
  };

  $.ajax(settings).done(function (response) {
    console.log(response);
    // SHOW OPERATION DETAILS;
    document.querySelector('#success_message').innerHTML += `<br><br>NFT id: ${response.token_id} updated! <i class="fa fa-check" aria-hidden="true"></i><br> <a target="_blank" href="${response.transaction_external_url}">check transaction</a>`;
  });


}
document.getElementById('mintupdater').onclick = updateNFT;




//////////////////////////////////////////////////////////////////////////////
// MINT
function initMinterModal() {
  minterModal.style.display = "block";
  console.log('showing modal');
  const urlParams = new URLSearchParams(window.location.search);
  const nftId = urlParams.get("nftId");
  console.log('nftId:', nftId);
  document.getElementById("token_id_input").value = nftId; //populate input
  // document.getElementById("address_input").value = accounts[0];//populate address
  document.getElementById("address_input").value = user.get("ethAddress"); //populate address

}

async function mint() {
  let tokenId = parseInt(document.getElementById("token_id_input").value);
  let address = document.getElementById("address_input").value;
  let amount = parseInt(document.getElementById("amount_input").value);
  //define contract
  const accounts = await web3.eth.getAccounts();
  const contract = new web3.eth.Contract(contractAbi, TOKEN_CONTRACT_ADDRESS);
  contract.methods.mint(address, tokenId, amount).send({
      from: user.get("ethAddress"),
      value: 0
    })
    .on('receipt', function (receipt) {
      Swal.fire(
        'Good job!',
        'Item minted!',
        'success'
      )
    })
}

document.getElementById('submit_mint').onclick = mint;

//////////////////////////
// TRANSFER
function initTransferModal() {
  transferModal.style.display = "block";
  console.log('showing transfer modal');
  const urlParams = new URLSearchParams(window.location.search);
  const nftId = urlParams.get("nftId");
  console.log('nftId:', nftId);
  document.getElementById("transferToken_id_input").value = nftId; //populate input
}

async function transfer() {
  let tokenId = parseInt(document.getElementById("transferToken_id_input").value);
  let amount = parseInt(document.getElementById("transferAmount_input").value);
  let address = document.getElementById("transferAddress_input").value;

  const options = {
    type: "erc1155",
    receiver: address,
    contractAddress: TOKEN_CONTRACT_ADDRESS,
    tokenId: tokenId,
    amount: amount,
    awaitReceipt: false // should be switched to false
  }

  let tx = await Moralis.transfer(options);
  console.log(tx);
  tx.on("transactionHash", (hash) => {
      'transactionHash: ',
      hash
    })
    .on("receipt", (receipt) => {
      console.log('receipt: ', receipt)
    })
    .on("confirmation", (confirmationNumber, receipt) => {
      'confirmation:',
      confirmationNumber,
      receipt
    })
    .on("error", (error) => {
      'error: ',
      error
    });


}

document.getElementById('submit_transfer').onclick = transfer;

//////////////////////////
// BURN
function initBurnerModal() {
  burnerModal.style.display = "block";
  console.log('showing burner modal');
  let user = Moralis.User.current();
  if (!user) {
    Swal.fire('Connect!', 'you have to connect your wallet to perform this action!', 'info');
  }

  const urlParams = new URLSearchParams(window.location.search);
  const nftId = urlParams.get("nftId");
  console.log('nftId:', nftId);
  document.getElementById("burnerToken_id_input").value = nftId; //populate input
  document.getElementById("burnerAddress_input").value = user.get("ethAddress"); //populate address

  console.log('burn from address: ', user.get("ethAddress"))
}

// burn(address account, uint256 id, uint256 value)
async function burn() {
  let tokenId = parseInt(document.getElementById("burnerToken_id_input").value);
  let amount = parseInt(document.getElementById("burnerAmount_input").value);
  let address = document.getElementById("burnerAddress_input").value;
  //define contract
  // const accounts = await web3.eth.getAccounts();
  const contract = new web3.eth.Contract(contractAbi, TOKEN_CONTRACT_ADDRESS);
  contract.methods.burn(address, tokenId, amount).send({
      from: user.get("ethAddress"),
      value: 0
    })
    .on('receipt', function (receipt) {
      Swal.fire('Good job!', 'Item burned!', 'success')
    })
}

document.getElementById('submit_burn').onclick = burn;




//////////////////////////
// BUY
async function initBuy() {


  let user = Moralis.User.current();
  if (!user) {
    try {
      let user = await Moralis.authenticate({
        signingMessage: "Hello from cryoptomurals!"
      })
      let userAddress = user.get('ethAddress');
      Swal.fire(
        'Connect!',
        'you have to connect your wallet to perform this action!',
        'success'
      );

      document.getElementById("logg").innerHTML = "<p>" + userAddress + " <i class='logout fa fa-sign-out' aria-hidden='true' onclick='event.stopPropagation();logOut()'></i> </p>";
      console.log('User address: ', userAddress)

    } catch (error) {
      console.log(error)
    }
  } else {

    Swal.fire(
      'sorry!',
      'this is a work in progress... no buying just yet!',
      'success'
    );
  }


}