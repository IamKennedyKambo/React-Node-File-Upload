//ALL your imports here

const createGallery = (obj, callback) => {
  var formData = new FormData();
  //Map through the object and append all keys to the formdata object
  for (const key of Object.keys(obj)) {
    formData.append("imgCollection", obj[key]);
  }

  //Use this callback to alert other functions when the formdata is ready for use
  callback(formData);
};

const uploadItem = () => {
  //Gallery here is the array of files from your input
  //Formdata is the result from the callback in createGallery...
  createGallery(gallery, (formData) => {
    axios.post(`url-here`, formData, {}).then((res) => {
      //Final is the object you'll be uploading,
      //Use bracket notation to append the urls from the backend to what youre uploading
      final["gallery"] = res.data.urls;
      axios.post("url-here", final, {}).then((response) => {});
    });
  });
};
