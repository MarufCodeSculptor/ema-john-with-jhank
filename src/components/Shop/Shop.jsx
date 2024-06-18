import React, { useEffect, useState } from 'react';
import {
  addToDb,
  deleteShoppingCart,
  getShoppingCart,
} from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';
import { Link, useLoaderData } from 'react-router-dom';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerpage, setItemsPerPage] = useState(10);
  const { count } = useLoaderData();

  const numberOfPages = Math.ceil(count / itemsPerpage);

  const pagesArray = [...Array(numberOfPages).keys()];
  console.log(pagesArray, 'this is pages array ');

  const handleItemsPerpage = e => {
    const val = parseInt(e.target.value);
    setItemsPerPage(val);
    setCurrentPage(1);
  };
  /**
   * have to do this thing
   * 01=> get the total numbers of products   =>  done
   * 02=> number of item per page dynamic   =>  done
   * todo => get the currrent page => working on it  =>
   */

  useEffect(() => {
    fetch(`http://localhost:5000/products?page=${currentPage}&size=${itemsPerpage}`)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, [currentPage,itemsPerpage]);

  useEffect(() => {
    const storedCart = getShoppingCart();
    const savedCart = [];
    // step 1: get id of the addedProduct
    for (const id in storedCart) {
      // step 2: get product from products state by using id
      const addedProduct = products.find(product => product._id === id);
      if (addedProduct) {
        // step 3: add quantity
        const quantity = storedCart[id];
        addedProduct.quantity = quantity;
        // step 4: add the added product to the saved cart
        savedCart.push(addedProduct);
      }
      // console.log('added Product', addedProduct)
    }
    // step 5: set the cart
    setCart(savedCart);
  }, [products]);

  const handleAddToCart = product => {
    // cart.push(product); '
    let newCart = [];
    // const newCart = [...cart, product];
    // if product doesn't exist in the cart, then set quantity = 1
    // if exist update quantity by 1
    const exists = cart.find(pd => pd._id === product._id);
    if (!exists) {
      product.quantity = 1;
      newCart = [...cart, product];
    } else {
      exists.quantity = exists.quantity + 1;
      const remaining = cart.filter(pd => pd._id !== product._id);
      newCart = [...remaining, exists];
    }

    setCart(newCart);
    addToDb(product._id);
  };

  const handleClearCart = () => {
    setCart([]);
    deleteShoppingCart();
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleNext = () => {
    if (currentPage < pagesArray.length) {
      setCurrentPage(currentPage + 1);
    }
  };
  return (
    <div className="shop-container">
      <div className="products-container">
        {products.map(product => (
          <Product
            key={product._id}
            product={product}
            handleAddToCart={handleAddToCart}
          ></Product>
        ))}
      </div>

      <div className="cart-container">
        <Cart cart={cart} handleClearCart={handleClearCart}>
          <Link className="proceed-link" to="/orders">
            <button className="btn-proceed">Review Order</button>
          </Link>
        </Cart>
      </div>
      {/* pagination container */}
      <div>
        <div className="pagination">
          <button onClick={handlePrev}>Prev</button>
          {pagesArray.map(number => (
            <button
              className={currentPage === number + 1 && 'selected'}
              onClick={e => {
                const currentvalue = parseInt(e.target.innerText);
                setCurrentPage(currentvalue);
              }}
              key={number}
            >
              {' '}
              {number + 1}
            </button>
          ))}
          <button onClick={handleNext}>next</button>
          <select onChange={handleItemsPerpage} name="nothing" id="">
            <option value="5"> 5 </option>
            <option value="10"> 10 </option>
            <option value="20"> 20 </option>
            <option value="50"> 50 </option>
          </select>
        </div>
        <div>
          <h3>current page {currentPage}</h3>
        </div>
      </div>
    </div>
  );
};

export default Shop;
