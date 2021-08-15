import { storage } from '~/plugins/firebase';

async function uploadHandler(files) {
    const promises = files.map(uploadImage);
    return Promise.all(promises);
}

async function uploadImage(file) {
    const imageRef = storage.ref(`image/${file.name}`);
    const uploadTaskSnapshot = await imageRef.put(file);
    return uploadTaskSnapshot.ref.getDownloadURL();
}

export default {
    uploadHandler
}