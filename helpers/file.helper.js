const createImagePath = (data) => {
    return data && data.file_name ?  `${ process.env.CLOUD_IMAGE_PATH }/${ data.path }/v${ data.version }/${ data.file_name }` : '/images/default-image.png';
}

module.exports = { createImagePath };