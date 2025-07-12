import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Tag, Plus, X, Upload, Loader2 } from 'lucide-react';
import itemService from '../services/itemService';
import axios from 'axios';
import imageCompression from 'browser-image-compression';

const AddItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    size: '',
    condition: '',
    brand: '',
    color: '',
    tags: [],
    images: []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const categories = [
    'dresses', 'tops', 'pants', 'shoes', 'accessories', 'outerwear', 'activewear', 'undergarments'
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
  const conditions = ['New', 'Like New', 'Excellent', 'Good', 'Fair'];
  const colors = ['Black', 'White', 'Gray', 'Brown', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Multicolor'];

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    // Validate files are images
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length < files.length) {
        toast.error('Only image files are allowed');
        return;
    }
    
    try {
        // Compression options
        const options = {
            maxSizeMB: 1, // Max file size in MB
            maxWidthOrHeight: 1920, // Max width/height
            useWebWorker: true
        };
        
        // Create preview URLs and compress images
        const compressPromises = validFiles.map(async (file) => {
            // Create preview immediately for better UX
            const preview = {
                id: Math.random().toString(36).substring(7),
                url: URL.createObjectURL(file),
                file: file
            };
            
            // Compress the image if it's too large
            if (file.size > 2 * 1024 * 1024) { // If > 2MB
                try {
                    const compressedFile = await imageCompression(file, options);
                    return {
                        ...preview,
                        file: compressedFile
                    };
                } catch (error) {
                    console.error('Compression failed:', error);
                    return preview;
                }
            }
            
            return preview;
        });
        
        const processedImages = await Promise.all(compressPromises);
        
        setPreviewImages([...previewImages, ...processedImages]);
        setFormData({
            ...formData,
            images: [...formData.images, ...processedImages.map(img => img.file)]
        });
    } catch (error) {
        console.error('Error processing images:', error);
        toast.error('Error processing images');
    }
};
  const removeImage = (imageId) => {
    const updatedPreviews = previewImages.filter(image => image.id !== imageId);
    
    // Find the index of the image to remove
    const imageIndex = previewImages.findIndex(image => image.id === imageId);
    
    // Create a new array of files excluding the removed one
    const updatedImages = [...formData.images];
    if (imageIndex !== -1) {
      updatedImages.splice(imageIndex, 1);
    }
    
    setPreviewImages(updatedPreviews);
    setFormData({
      ...formData,
      images: updatedImages
    });
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.size || !formData.condition) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setIsSubmitting(true);

      try {
    // Use itemService.createItem instead of direct axios call
    const result = await itemService.createItem(formData);
    
    if (result) {
      toast.success('Item added successfully!');
      navigate('/dashboard');
    } else {
      toast.error('Failed to add item. Please try again.');
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to add item. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container-padding max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">List Your Item</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Share your fashion items and give them a second life
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {/* Basic Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gradient-purple">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                  placeholder="e.g. Vintage Denim Jacket"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                  placeholder="e.g. Levi's"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                  placeholder="Describe your item in detail including any wear and tear"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gradient-purple">Item Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Size <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                >
                  <option value="">Select Size</option>
                  {sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                >
                  <option value="">Select Condition</option>
                  {conditions.map((condition) => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                >
                  <option value="">Select Color</option>
                  {colors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gradient-purple">Tags</h2>
            <div className="flex items-center mb-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                  placeholder="Add tags (e.g. summer, casual)"
                />
              </div>
              <Button 
                type="button"
                onClick={addTag}
                variant="secondary" 
                className="ml-2"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag, index) => (
                  <div 
                    key={index} 
                    className="flex items-center bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full px-3 py-1"
                  >
                    <span className="text-sm">{tag}</span>
                    <button 
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1.5 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gradient-purple">
              Images <span className="text-red-500">*</span>
            </h2>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
              <input 
                type="file" 
                id="images" 
                multiple 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
              <label htmlFor="images" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Click to upload images</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    PNG, JPG, GIF up to 5MB each
                  </p>
                </div>
              </label>
            </div>

            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {previewImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img 
                      src={image.url} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'List Item'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;