import React from "react";
import { Fade } from "react-reveal"; // Import Fade effect from react-reveal

function CareerPage() {
  return (
    <div className="flex flex-col gap-6  sm:gap-0 px-8 sm:px-0 justify-around mt-8 ">
      <div className="flex justify-center ">
        <Fade>
          <img
            className="w-full h-auto sm:w-1/2 lg:w-1/2 object-cover rounded-xl"
            src="https://cdn.leonardo.ai/users/73e78dc5-77d2-47e7-afe6-84668d032570/generations/1bfdc948-09ce-409d-9ca1-c7bc4e78c16f/Leonardo_Phoenix_Create_a_highdetail_scene_of_two_people_engag_1.jpg"
            alt="interview img"
          />
        </Fade>
      </div>
      <Fade bottom>
        <h1 className="custom-text w-full flex justify-center my-2 md:text-3xl text-xl">
          Interviewing at AI Chef Master
        </h1>
      </Fade>
      <Fade bottom>
        <h1 className="w-full flex justify-center">
          <a
            href="#HiringProcess"
            className="bg-[#008080] text-white px-4 py-2 mt-3 rounded-md"
          >
            Learn More
          </a>
        </h1>
      </Fade>
    </div>
  );
}

export default CareerPage;
