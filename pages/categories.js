import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import { withSwal } from "react-sweetalert2";

function Categories({ swal }) {
  const [editedCategory, setEditedCategory] = useState(null);
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);
  useEffect(() => {
    fetchCategories();
  }, []);
  function fetchCategories() {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
      console.log(result.data);
    });
  }
  async function saveCategory(ev) {
    ev.preventDefault();
    const data = {
      name,
      parentCategory,
      properties: properties.map((p) => ({
        name: p.name,
        values: p.values.split(","),
      })),
    };
    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put("/api/categories", data);
    } else {
      await axios.post("/api/categories", data);
    }
    setName("");
    setParentCategory("");
    setProperties([]);
    fetchCategories();
  }

  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setProperties(
      category.properties.map(({ name, values }) => ({
        name,
        values: values.join(","),
      }))
    );
  }

  function deleteCategory(category) {
    swal
      .fire({
        titel: "Are you sure ?",
        text: `Do you want to delete ${category.name}`,
        showCancelButton: true,
        reverseButtons: true,
        confirmButtonColor: "#7f1d1d",
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const { _id } = category;
          await axios.delete("/api/categories?_id=" + _id, { _id });
          fetchCategories();
        }
      });
  }

  function addProperty() {
    setProperties((prev) => {
      return [...prev, { name: "", values: "" }];
    });
  }
  function handlePropertyChangeName(index, property, newName) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }

  function handlePropertyChangeValues(index, property, newValues) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }

  function removeProperty(indexToRemove) {
    setProperties((prev) => {
      return [...prev].filter((p, pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  }
  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Edit category ${editedCategory.name}`
          : "Create new category"}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder="Category text"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
          <select
            onChange={(ev) => setParentCategory(ev.target.value)}
            value={parentCategory}
          >
            <option value="0">No parent category</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="block">Propreties</label>
          <button
            type="button"
            onClick={addProperty}
            className="btn-tertiary mb-2"
          >
            Add new property
          </button>
          {properties.length > 0 &&
            properties.map((property, index) => (
              <div key={properties._id} className="flex gap-1 mb-2">
                <input
                  className="mb-0"
                  onChange={(ev) =>
                    handlePropertyChangeName(index, property, ev.target.value)
                  }
                  value={property.name}
                  type="text"
                  placeholder="property name (example: color)"
                />
                <input
                  className="mb-0"
                  onChange={(ev) =>
                    handlePropertyChangeValues(index, property, ev.target.value)
                  }
                  value={property.values}
                  type="text"
                  placeholder="values, comma separated"
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => removeProperty(index)}
                >
                  Remove
                </button>
              </div>
            ))}
        </div>
        <div className="flex gap-1">
          {" "}
          <button type="submit" className="btn-primary p-1 ">
            Save
          </button>
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                  setEditedCategory(null),
                  setName(""),
                  setParentCategory(""),
                  setProperties([]);
              }}
              className="btn-secondary p-1 ml-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Category name</td>
              <td>Parent category</td>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 &&
              categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category?.parent?.name}</td>

                  <td className="flex">
                    <button
                      onClick={() => editCategory(category)}
                      className="btn-tertiary mr-1 flex items-center"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="btn-secondary mr-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);
