import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

const stateCityData = {
  "Tamil Nadu": {
    Ariyalur: ["621704"],
    Chengalpattu: ["603001", "603002"],
    Chennai: ["600001", "600002", "600003"],
    Coimbatore: ["641001", "641002"],
    Cuddalore: ["607001", "607002"],
    Dharmapuri: ["636701"],
    Dindigul: ["624001", "624002"],
    Erode: ["638001", "638002"],
    Kallakurichi: ["606202"],
    Kancheepuram: ["631501"],
    Karur: ["639001"],
    Krishnagiri: ["635001"],
    Madurai: ["625001", "625002"],
    Mayiladuthurai: ["609001"],
    Nagapattinam: ["611001"],
    Namakkal: ["637001"],
    Nilgiris: ["643001"],
    Perambalur: ["621212"],
    Pudukkottai: ["622001"],
    Ramanathapuram: ["623501"],
    Ranipet: ["632401"],
    Salem: ["636001", "636002"],
    Sivaganga: ["630561"],
    Tenkasi: ["627811"],
    Thanjavur: ["613001"],
    Theni: ["625531"],
    Thoothukudi: ["628001", "628002"],
    Tiruchirappalli: ["620001", "620002"],
    Tirunelveli: ["627001", "627002"],
    Tirupathur: ["635601"],
    Tiruppur: ["641601"],
    Tiruvallur: ["602001"],
    Tiruvannamalai: ["606601"],
    Tiruvarur: ["610001"],
    Vellore: ["632001"],
    Viluppuram: ["605602"],
    Virudhunagar: ["626001"],
  },
};

export const Address = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });

  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "state") {
      const citiesList = Object.keys(stateCityData[value] || {});
      setCities(citiesList);
      setFormData((prev) => ({ ...prev, state: value, city: "", pincode: "" }));
      setPincodes([]);
    } else if (name === "city") {
      setFormData((prev) => ({ ...prev, city: value, pincode: "" }));
      setPincodes(stateCityData[formData.state][value] || []);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, mobile, address_line, city, state, pincode, country } =
      formData;

    if (!name || !mobile || !address_line || !city || !state || !pincode) {
      toast.error("Please fill all required fields");
      return;
    }

    if (mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    try {
      const response = await Axios({
        ...SummaryApi.createAddress,
        data: {
          name: formData?.name,
          address_line: formData?.address_line,
          city: formData?.city,
          state: formData?.state,
          pincode: formData?.pincode,
          country: formData?.country,
          mobile: formData?.mobile,
          isDefault: formData?.isDefault,
        },
      });

      if (response.data.success) {
        toast.success("Address saved successfully!");
        navigate(-1)
      }
    } catch (error) {}
  };

  return (
    <section className="bg-gray-800 text-white/70 p-4 ">
      
      <div className="max-w-md mx-auto bg-gray-900 rounded-lg p-6 mt-20">
        <ToastContainer theme="dark"  />
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add New Address</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                maxLength="10"
                pattern="[0-9]{10}"
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Street Address *
              </label>
              <textarea
                name="address_line"
                value={formData.address_line}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">State *</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                required
              >
                <option value="">Select State</option>
                {Object.keys(stateCityData).map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                required
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Pincode *
              </label>
              <select
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                required
              >
                <option value="">Select Pincode</option>
                {pincodes.map((pin) => (
                  <option key={pin} value={pin}>
                    {pin}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Country *
              </label>
              <input
                type="text"
                name="country"
                readOnly
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="defaultAddress"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 border-gray-600 rounded"
              />
              <label htmlFor="defaultAddress" className="ml-2 text-sm">
                Set as default address
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Save Address
          </button>
        </form>
      </div>
    </section>
  );
};
