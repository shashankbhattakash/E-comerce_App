import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductDetailsDialog from "@/components/shopping-view/product-details";

import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { getFeatureImages } from "@/store/common-slice";

import {
  Airplay,
  BabyIcon,
  Briefcase,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Shirt,
  ShirtIcon,
  ShoppingBasket,
  Sparkles,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
  ShoppingBag,
  BadgeRussianRuble,
  BadgePercent,
  BadgeDollarSign,
} from "lucide-react";

// Categories
const categoriesWithIcon = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "women", label: "Women", icon: CloudLightning },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: WatchIcon },
  { id: "footwear", label: "Footwear", icon: UmbrellaIcon },
];

// Brands
const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: Shirt },
  { id: "adidas", label: "Adidas", icon: WashingMachine },
  { id: "puma", label: "Puma", icon: ShoppingBasket },
  { id: "levi", label: "Levi's", icon: Airplay },
  { id: "zara", label: "Zara", icon: Images },
  { id: "h&m", label: "H&M", icon: Heater },
  { id: "blackberrys", label: "Blackberrys", icon: Briefcase },
  { id: "snitch", label: "Snitch", icon: Sparkles },
  { id: "indian-garage", label: "The Indian Garage Co.", icon: ShoppingBag },
  { id: "raymond", label: "Raymond", icon: BadgeDollarSign },
  { id: "peter-england", label: "Peter England", icon: BadgePercent },
  { id: "calvin-klein", label: "Calvin Klein", icon: BadgeRussianRuble },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Navigate to filtered listing page
  const handleNavigateToListingPage = (item, section) => {
    sessionStorage.removeItem("filters");
    const currentFilter = { [section]: [item.id] };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  };

  // Fetch product details
  const handleGetProductDetails = (productId) => {
    dispatch(fetchProductDetails(productId));
  };

  // Add product to cart
  const handleAddtoCart = (productId) => {
    if (!user) return toast({ title: "Please login to add items to cart" });
    dispatch(
      addToCart({
        userId: user.id,
        productId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user.id));
        toast({ title: "Product added to cart" });
      }
    });
  };

  // Open dialog when productDetails updates
  useEffect(() => {
    if (productDetails) setOpenDetailsDialog(true);
  }, [productDetails]);

  // Auto slide carousel
  useEffect(() => {
    if (!featureImageList || featureImageList.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featureImageList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featureImageList]);

  // Fetch all products
  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  // Fetch feature images
  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Carousel */}
      <div className="relative w-full h-[600px] overflow-hidden">
        {featureImageList &&
          featureImageList.map((slide, index) => (
            <img
              key={`slide-${index}`}
              src={slide.image}
              alt={`slide-${index}`}
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prev) =>
                (prev - 1 + featureImageList.length) % featureImageList.length
            )
          }
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % featureImageList.length)
          }
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Categories */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoriesWithIcon.map((category, index) => (
              <Card
                key={category.id ?? `category-${index}`}
                onClick={() =>
                  handleNavigateToListingPage(category, "category")
                }
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <category.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold">{category.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Brand</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {brandsWithIcon.map((brand, index) => (
              <Card
                key={brand.id ?? `brand-${index}`}
                onClick={() => handleNavigateToListingPage(brand, "brand")}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <brand.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold">{brand.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Featured Products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList && productList.length > 0 ? (
              productList.map((product, index) => (
                <ShoppingProductTile
                  key={product.id ?? `product-${index}`}
                  product={product}
                  onViewDetails={() => handleGetProductDetails(product.id)}
                  onAddToCart={() => handleAddtoCart(product.id)}
                />
              ))
            ) : (
              <p className="text-center col-span-full">
                No products available.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Product Details Dialog */}
      {openDetailsDialog && productDetails && (
        <ProductDetailsDialog
          product={productDetails}
          open={openDetailsDialog}
          onClose={() => setOpenDetailsDialog(false)}
          onAddToCart={() => handleAddtoCart(productDetails.id)}
        />
      )}
    </div>
  );
}

export default ShoppingHome;
