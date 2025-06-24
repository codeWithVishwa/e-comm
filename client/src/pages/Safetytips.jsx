import React from "react";
import { Footer } from "../components/Footer";

const safetyTips = [
  {
    title: "Buy from Licensed Sellers",
    tip: "Purchase only branded and government-approved fireworks from licensed shops.",
    image:
      "https://t4.ftcdn.net/jpg/00/26/78/37/360_F_26783740_XMdN3JhjcM4oon1MWCEGLCuBBDX5QQ1o.jpg",
    alt: "Licensed fireworks shop",
  },
  {
    title: "Read Instructions Carefully",
    tip: "Always follow the safety and usage instructions on the cracker packaging.",
    image:
      "https://thumbs.dreamstime.com/z/text-sign-showing-read-instructions-conceptual-photo-carefully-read-something-someone-tells-you-to-do-magnifying-glass-137634183.jpg",
    alt: "Reading instructions",
  },
  {
    title: "Use in Open Spaces",
    tip: "Light fireworks in open, outdoor areas away from buildings and flammable materials.",
    image:
      "https://media.istockphoto.com/id/1254957029/vector/festive-city-night-concept.jpg?s=612x612&w=0&k=20&c=ssIjfg24XqziuhtGo0VdLP7pJ23obFF8lkzAJz3WgS0=",
    alt: "Open field for fireworks",
  },
  {
    title: "Supervise Children",
    tip: "Never allow kids to burst crackers alone. Adult supervision is a must.",
    image:
      "https://www.shutterstock.com/image-vector/kids-enjoying-firecracker-celebrating-diwali-600nw-491078806.jpg",
    alt: "Adult supervising children with fireworks",
  },
  {
    title: "Keep Water Nearby",
    tip: "Always keep a bucket of water, sand, or a fire extinguisher handy.",
    image:
      "https://www.shutterstock.com/image-vector/blue-plastic-bucket-filled-water-600nw-1590037033.jpg",
    alt: "Bucket of water and fire extinguisher",
  },
  {
    title: "Avoid Relighting Duds",
    tip: "Never try to relight malfunctioning crackers. Soak them in water safely.",
    image:
      "https://static.vecteezy.com/system/resources/previews/024/144/160/non_2x/cartoon-boys-enjoying-with-firecrackers-on-white-background-vector.jpg",
    alt: "Malfunctioning firework",
  },
  {
    title: "Wear Cotton Clothes",
    tip: "Avoid wearing synthetic clothing, as it catches fire easily. Opt for cotton.",
    image:
      "https://media.istockphoto.com/id/1411678076/vector/t-shirt-icon.jpg?s=612x612&w=0&k=20&c=Ci_UmkqRt1rE-BOeGTYpqfijARRPGN2NnguCAPtEHZQ=",
    alt: "Cotton clothing",
  },
  {
    title: "Protect Pets & the Environment",
    tip: "Use noiseless or eco-friendly crackers to avoid disturbing animals and nature.",
    image:
      "https://www.shutterstock.com/image-vector/pet-insurance-concept-dog-cat-600nw-2262082801.jpg",
    alt: "Dog with protective earmuffs",
  },
];

const SafetyTips = () => {
  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white/5 shadow-md rounded-lg p-6 mt-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-center mb-6 text-indigo-600">
          <span className="inline-block mr-2"></span>
          Safety <span className="text-white">Tips</span>
          <span className="inline-block ml-2"></span>
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          {safetyTips.map((item, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-green-400 mb-2">
                  {item.title}
                </h2>
                <p className="text-gray-300">{item.tip}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-red-900/30 rounded-lg text-center">
          <h3 className="text-xl font-bold text-red-400 mb-2">
            Emergency Contacts
          </h3>
          <p className="text-white">
            In case of emergency, call <span className="font-bold">101</span>{" "}
            (Fire),
            <span className="font-bold"> 102/108</span> (Ambulance), or
            <span className="font-bold"> 100</span> (Police).
          </p>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default SafetyTips;
