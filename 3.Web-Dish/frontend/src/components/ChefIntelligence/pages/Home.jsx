import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { toast } from "react-hot-toast";
import { darkColors, lightColors } from "../data/homeTheme";
import Typewriter from "../components/Typewriter";
import { IoIosAdd, IoIosClose } from "react-icons/io";

export default function Home({ lightMode }) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const colors = lightMode ? lightColors : darkColors;
  let userData;
  try {
    userData = JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    userData = {};
  }

  const [ingredientData, setIngredientData] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
    ingredient: "",
    quantity: "",
    unit: "",
  });

  const handleNewIngredientChange = (event) => {
    const { name, value } = event.target;
    setNewIngredient((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddIngredient = () => {
    if (!userData) return toast.error("Please login to proceed!");
    if (
      newIngredient.ingredient &&
      newIngredient.quantity &&
      newIngredient.unit
    ) {
      setIngredientData([...ingredientData, newIngredient]);
      setNewIngredient({ ingredient: "", quantity: "", unit: "" });
    } else {
      toast.error("Please fill all ingredient fields");
    }
  };

  const handleRemoveIngredient = (index) => {
    const updatedIngredientData = ingredientData.filter((_, i) => i !== index);
    setIngredientData(updatedIngredientData);
  };

  const [equipmentData, setEquipmentData] = useState([]);
  const [newEquipment, setNewEquipment] = useState("");

  const handleAddEquipment = () => {
    if (!userData) return toast.error("Please login to proceed!");
    if (!newEquipment.trim()) return;
    setEquipmentData([...equipmentData, newEquipment]);
    setNewEquipment("");
  };

  const handleStartProcess = async (e) => {
    e.preventDefault();

    if (!userData) return toast.error("Please login to proceed!");
    if (ingredientData.length === 0)
      return toast.error("Please add at least one ingredient");

    const data = {
      user: {
        email: userData.email,
        name: userData.name,
        user_id: userData.user_id,
      },
      ingredients: ingredientData,
      equipments: equipmentData,
    };

    await fetch(`${import.meta.env.VITE_API_URL}/start-process`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(() => {
        toast.success("Started processing...");
        setIngredientData([]);
        navigate("/sec-intelligence");
        // navigate("generatedDish");
      })
      .catch(() => toast.error("Something went wrong."));
  };

  return (
    <div
      className={`${colors.back} flex flex-col items-center justify-center min-h-screen w-full px-4`}
    >
      <div
        className={`${colors.blackColor} w-full max-w-4xl rounded-lg shadow-lg p-8 my-8`}
      >
        <Typewriter text="Chef Intelligence" delay={200} />
        <br /> <br />
        <p
          className={`${colors.textParagraph} text-lg text-[#003D4C] mb-8 text-left`}
        >
          Elevate your culinary skills with the power of AI. Search for
          ingredients and equipment effortlessly to create masterful dishes.
          Start your culinary adventure today with AI Chef Master!
        </p>
        {/* Recommended Dishes */}
        <h2 className="text-lg font-medium text-[#003D4C] mb-4">
          Recommended Dishes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link to="/sec-intelligence">
            <div className="bg-[#F3F3F3] rounded-lg p-6 cursor-pointer hover:bg-[#E6E6E6] transition-colors">
              <div className="h-48 mb-4 overflow-hidden rounded">
                <img
                  src="https://umamidays.com/wp-content/uploads/2021/05/salmon-lemon-garlic-sauce.jpg"
                  alt="dish2"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[#003D4C]">Grilled Salmon with Lemon Butter</p>
            </div>
          </Link>
          <Link to="/sec-intelligence">
            <div className="bg-[#F3F3F3] rounded-lg p-6 cursor-pointer hover:bg-[#E6E6E6] transition-colors">
              <div className="h-48 mb-4 overflow-hidden rounded">
                <img
                  src="https://www.simplyrecipes.com/thmb/YuOMkKKjH9ezQGCetN7yAmVFANc=/2000x1333/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__simply_recipes__uploads__2012__11__Vegetarian-Lasagna-LEAD-1-6173a71bfd1347aa8d7659150e87b8f4.jpg"
                  alt="dish2"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[#003D4C]">
                Vegetarian Spinach and Mushroom Lasagna
              </p>
            </div>
          </Link>
          <Link to="/sec-intelligence">
            <div className="bg-[#F3F3F3] rounded-lg p-6 cursor-pointer hover:bg-[#E6E6E6] transition-colors">
              <div className="h-48 mb-4 overflow-hidden rounded">
                <img
                  src="https://www.licious.in/blog/wp-content/uploads/2020/12/Tandoori-Chicken.jpg"
                  alt="dish2"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[#003D4C]">
                Spicy Thai Chicken With Special Sauce
              </p>
            </div>
          </Link>
        </div>
        {/* */}
        {/* Ingredients section */}
        <div className={`${colors.blackColor} mb-6`}>
          <div className="bg-[#F3F3F3] rounded-lg p-6 cursor-pointer hover:bg-[#E6E6E6] transition-colors">
            <h2 className="text-lg font-medium text-[#003D4C] mb-4">
              Ingredients
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                className="w-full p-2 border border-gray-300 rounded placeholder-gray-400 focus:outline-none focus:border-yellow-500 bg-white text-[#003D4C]"
                type="text"
                placeholder="Ingredient name"
                name="ingredient"
                value={newIngredient.ingredient}
                onChange={handleNewIngredientChange}
              />
              <input
                className="w-full p-2 border border-gray-300 rounded placeholder-gray-400 focus:outline-none focus:border-yellow-500 bg-white text-[#003D4C]"
                type="number"
                placeholder="Quantity"
                name="quantity"
                value={newIngredient.quantity}
                onChange={handleNewIngredientChange}
              />
              <select
                name="unit"
                value={newIngredient.unit}
                onChange={handleNewIngredientChange}
                className="w-full p-2 border border-gray-300 rounded placeholder-gray-400 focus:outline-none focus:border-yellow-500 bg-white text-[#003D4C]"
              >
                <option value="">Select Unit</option>
                <option value="gram">gram</option>
                <option value="mL">mL</option>
                <option value="teaspoon">teaspoon</option>
                <option value="tablespoon">tablespoon</option>
                <option value="whole">piece</option>
              </select>
            </div>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleAddIngredient}
                type="button"
                className="bg-green-500 text-white p-2 rounded-full"
              >
                <IoIosAdd className="text-2xl" />
              </button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {ingredientData.map((ingredient, index) => (
                <li
                  key={index}
                  className="bg-amber-300 font-medium flex items-center gap-2 px-2 py-1 rounded-md"
                >
                  <span>{`${ingredient.ingredient} (${ingredient.quantity} ${ingredient.unit})`}</span>
                  <IoIosClose
                    onClick={() => handleRemoveIngredient(index)}
                    className="text-xl cursor-pointer hover:bg-amber-500 rounded-full"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* equipments */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
          <div className="bg-[#F3F3F3] rounded-lg p-6 cursor-pointer hover:bg-[#E6E6E6] transition-colors">
            <h2 className="text-lg font-medium text-[#003D4C] mb-4">
              Equipments
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <input
                name="equipments"
                onChange={(e) => setNewEquipment(e.target.value)}
                placeholder="eg. Oven"
                className="flex-1 p-2 border border-gray-300 rounded placeholder-gray-400 focus:outline-none focus:border-yellow-500 bg-white text-[#003D4C]"
                value={newEquipment}
              />
              <button
                onClick={handleAddEquipment}
                type="button"
                className="bg-green-500 text-white p-2 rounded-full"
              >
                <IoIosAdd className="text-2xl" />
              </button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {equipmentData.map((equipment, index) => (
                <li
                  key={index}
                  className="bg-amber-300 font-medium flex items-center gap-2 px-2 py-1 rounded-md"
                >
                  <span>{equipment}</span>
                  <IoIosClose
                    onClick={() => {
                      const updatedEquipmentData = equipmentData.filter(
                        (_, i) => i !== index
                      );
                      setEquipmentData(updatedEquipmentData);
                    }}
                    className="text-xl cursor-pointer hover:bg-amber-500 rounded-full"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* btns */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setOpenOverview(true)}
            className="bg-[#FF7F00] hover:bg-[#E06E00] text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Overview
          </button>
          <button
            onClick={handleStartProcess}
            className="bg-[#003D4C] hover:bg-[#002A35] text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Start to Process
          </button>
        </div>
      </div>
    </div>
  );
}

// import Overview from "../components/Overview";
{
  /* {openOverview && <Overview setOpenOverview={setOpenOverview} ingredientData={ingredientData} equipmentData={equipmentData} />} */
}
// {
//     ingredientData.map((row, index) => (
//         <div key={index} className="my-4">
//             <div className="border border-gray-300 p-4 rounded-md shadow-md">
//                 <ul>
//                     <li>
//                         <strong>Ingredient:</strong> {row.ingredient}
//                     </li>
//                     <li>
//                         <strong>Quantity:</strong> {row.quantity}
//                     </li>
//                 </ul>
//             </div>
//         </div>
//     ))
// }
