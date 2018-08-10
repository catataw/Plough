import EmberUploader from 'ember-uploader';

export default EmberUploader.FileField.extend({

  urlPath:'',
  filesDidChange: function(files) {
    var self = this;
    const uploader = EmberUploader.Uploader.create({
      multiple: true,
      url: this.get('url')
    });
    uploader.on('didUpload', response => {
      // S3 will return XML with url
      //let uploadedUrl = $(response).find('Location')[0].textContent;
      // http://yourbucket.s3.amazonaws.com/file.png
      var resp = JSON.parse(response);
      console.log(resp);
      if(resp.status ==1){
        alert('文件上传成功');
        self.set('urlPath',resp.path);
      }

      //alert(uploadedUrl);
     // uploadedUrl = decodeURIComponent(uploadedUrl);
    });

    if (!Ember.isEmpty(files)) {
      // this second argument is optional and can to be sent as extra data with the upload
      uploader.upload(files[0], { });
    }
  },

});
