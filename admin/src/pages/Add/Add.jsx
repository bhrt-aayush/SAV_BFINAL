import React, {useState } from 'react'
import './Add.css'
import {toast} from 'react-toastify'
import { assets } from '../../../public/assets/admin_assets/assets.js'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Add = () => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [data, setData] = useState({
        name:'',
        description:'',
        price:'',
        category:'Salad'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({...data, [name]: value}));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        
        if (!image) {
            toast.error("Please select an image");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        const url = "http://localhost:4000";
        
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', Number(data.price));
        formData.append('category', data.category);
        formData.append('image', image);

        try {
            const response = await axios.post(`${url}/api/food/add`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if(response.data.success) {
                setData({
                    name:'',
                    description:'',
                    price:'',
                    category:'Salad'
                });
                setImage(null);
                toast.success(response.data.message);
                // Navigate to list page to see the new item
                navigate('/list');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error adding food:", error);
            toast.error(error.response?.data?.message || "Error adding food");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='add'>
            <form className="flex-col" onSubmit={onSubmitHandler}>
                <div className="add-img-upload flex-col">
                    <p>Upload Image</p>
                    <label htmlFor="image">
                        <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                    </label>
                    <input 
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file && file.type.startsWith('image/')) {
                                setImage(file);
                            } else {
                                setImage(null);
                                toast.error("Please select an image file.");
                                // Clear the file input value to allow selecting the same file again after an error
                                e.target.value = null;
                            }
                        }}
                        type="file" 
                        id='image' 
                        hidden 
                        accept="image/*"
                        required 
                    />
                </div>
                <div className="add-product-name flex-col">
                    <p>Product name</p>
                    <input 
                        onChange={onChangeHandler} 
                        value={data.name} 
                        type="text" 
                        name='name' 
                        placeholder='Type Here'
                        required 
                    />
                </div>
                <div className="add-product-description flex-col">
                    <p>Product description</p>
                    <textarea 
                        onChange={onChangeHandler} 
                        value={data.description} 
                        name="description" 
                        rows='6' 
                        placeholder='Write content here' 
                        required
                    ></textarea>
                </div>
                <div className="add-category-price">
                    <div className="add-category flex-col">
                        <p>Product category</p>
                        <select 
                            onChange={onChangeHandler} 
                            name="category"
                            value={data.category}
                            required
                        >
                            <option value="Salad">Salad</option>
                            <option value="Rolls">Rolls</option>
                            <option value="Deserts">Deserts</option>
                            <option value="Sandwich">Sandwich</option>
                            <option value="Cake">Cake</option>
                            <option value="Pure Veg">Pure Veg</option>
                            <option value="Pasta">Pasta</option>
                            <option value="Noodles">Noodles</option>
                        </select>
                    </div>
                    <div className="add-price flex-col">
                        <p>Product price</p>
                        <input 
                            onChange={onChangeHandler} 
                            value={data.price} 
                            type="number" 
                            name='price' 
                            placeholder='रु20'
                            min="0"
                            step="0.01"
                            required 
                        />
                    </div>
                </div>
                <button 
                    type='submit' 
                    className='add-btn'
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Adding...' : 'ADD'}
                </button>
            </form>
        </div>
    );
};

export default Add;