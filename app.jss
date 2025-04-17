function hideMessage() {
  const imageInput = document.getElementById('imageUpload');
  const message = document.getElementById('message').value;
  const downloadLink = document.getElementById('downloadLink');

  if (imageInput.files.length === 0 || !message) {
    alert("Please upload an image and enter a message.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    const imageData = event.target.result;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Convert message to binary
      const binaryMessage = stringToBinary(message);
      let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let data = imgData.data;

      // Hide the message in the image
      let messageIndex = 0;
      for (let i = 0; i < data.length && messageIndex < binaryMessage.length; i += 4) {
        if (messageIndex < binaryMessage.length) {
          data[i] = (data[i] & 0xFE) | parseInt(binaryMessage[messageIndex++], 2);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.style.display = 'inline-block';
      }, 'image/png');
    };
    img.src = imageData;
  };
  reader.readAsDataURL(imageInput.files[0]);
}

function revealMessage() {
  const imageInput = document.getElementById('imageReveal');
  const hiddenMessage = document.getElementById('hiddenMessage');

  if (imageInput.files.length === 0) {
    alert("Please upload an image.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    const imageData = event.target.result;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let data = imgData.data;
      let binaryMessage = '';

      // Extract the hidden message
      for (let i = 0; i < data.length; i += 4) {
        binaryMessage += (data[i] & 0x01).toString();
      }

      const decodedMessage = binaryToString(binaryMessage);
      hiddenMessage.textContent = decodedMessage;
      hiddenMessage.style.display = 'block';
    };
    img.src = imageData;
  };
  reader.readAsDataURL(imageInput.files[0]);
}

function stringToBinary(str) {
  return str.split('').map(char => {
    return char.charCodeAt(0).toString(2).padStart(8, '0');
  }).join('');
}

function binaryToString(binary) {
  return binary.match(/.{8}/g).map(byte => {
    return String.fromCharCode(parseInt(byte, 2));
  }).join('');
}
