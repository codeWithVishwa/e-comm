import Axios from "../utils/Axios"; // your customized Axios
import SummaryApi from "../common/SummaryApi";

export const UploadImage = async (files) => {
  try {
    const formData = new FormData();
    formData.append('image', files[0]); // field name must match backend

    const response = await Axios({
      url: SummaryApi.uploadImage.url,
      method: SummaryApi.uploadImage.method,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};
 export default UploadImage