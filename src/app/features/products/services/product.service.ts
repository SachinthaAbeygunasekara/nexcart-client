import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../../../core/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private mockProducts: Product[] = [
    {
      id: 1,
      name: 'Wireless Bluetooth Speaker',
      description: 'High-quality sound with 12-hour battery life',
      price: 2999,
      originalPrice: 5999,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop',
      category: 'Electronics',
      rating: 4.5,
      stock: 50,
      discount: 50,
    },
    {
      id: 2,
      name: 'LED Smart Bulb',
      description: 'WiFi enabled RGB LED bulb with app control',
      price: 1499,
      originalPrice: 2999,
      image: 'https://images.unsplash.com/photo-1578072691160-cb4313cb537a?w=300&h=300&fit=crop',
      category: 'Electronics',
      rating: 4.2,
      stock: 100,
      discount: 50,
    },
    {
      id: 3,
      name: 'USB-C Hub',
      description: 'Multi-port USB-C hub with HDMI and USB 3.0',
      price: 3499,
      originalPrice: 6999,
      image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300&h=300&fit=crop',
      category: 'Electronics',
      rating: 4.7,
      stock: 75,
      discount: 50,
    },
    {
      id: 4,
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with 2.4GHz connection',
      price: 1299,
      originalPrice: 2499,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop',
      category: 'Electronics',
      rating: 4.3,
      stock: 150,
      discount: 48,
    },
    {
      id: 5,
      name: 'Portable Phone Charger',
      description: '20000mAh power bank with fast charging',
      price: 1999,
      originalPrice: 3999,
      image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=300&fit=crop',
      category: 'Electronics',
      rating: 4.6,
      stock: 200,
      discount: 50,
    },
    {
      id: 6,
      name: 'Wireless Earbuds',
      description: 'True wireless earbuds with noise cancellation',
      price: 4999,
      originalPrice: 9999,
      image: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=300&h=300&fit=crop',
      category: 'Electronics',
      rating: 4.8,
      stock: 80,
      discount: 50,
    },
    {
      id: 7,
      name: 'Webcam 1080p',
      description: 'Full HD webcam with built-in microphone',
      price: 2499,
      originalPrice: 4999,
      image: 'https://images.unsplash.com/photo-1598921925518-d67eac9db66e?w=300&h=300&fit=crop',
      category: 'Electronics',
      rating: 4.4,
      stock: 60,
      discount: 50,
    },
    {
      id: 8,
      name: 'Screen Protector',
      description: 'Tempered glass screen protector for smartphone',
      price: 499,
      originalPrice: 999,
      image: 'https://images.unsplash.com/photo-1600555379765-19e2e91eb4e4?w=300&h=300&fit=crop',
      category: 'Accessories',
      rating: 4.1,
      stock: 300,
      discount: 50,
    },
    {
      id: 9,
      name: 'Phone Stand',
      description: 'Adjustable phone stand for desk',
      price: 799,
      originalPrice: 1599,
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf4ef4c91?w=300&h=300&fit=crop',
      category: 'Accessories',
      rating: 4.0,
      stock: 120,
      discount: 50,
    },
    {
      id: 10,
      name: 'Cable Organizer',
      description: 'Desktop cable management organizer',
      price: 599,
      originalPrice: 1199,
      image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300&h=300&fit=crop',
      category: 'Accessories',
      rating: 3.9,
      stock: 180,
      discount: 50,
    },
    {
      id: 11,
      name: 'Laptop Cooling Pad',
      description: 'Cooling pad with 5 fans for laptop',
      price: 2199,
      originalPrice: 4399,
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop',
      category: 'Electronics',
      rating: 4.5,
      stock: 90,
      discount: 50,
    },
    {
      id: 12,
      name: 'USB Desk Lamp',
      description: 'LED desk lamp with USB port',
      price: 1399,
      originalPrice: 2799,
      image: 'https://images.unsplash.com/photo-1565636192335-14375bc58011?w=300&h=300&fit=crop',
      category: 'Electronics',
      rating: 4.2,
      stock: 110,
      discount: 50,
    },
  ];

  getProducts(): Observable<Product[]> {
    return of(this.mockProducts);
  }

  getProductById(id: number): Observable<Product | undefined> {
    return of(this.mockProducts.find((p) => p.id === id));
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return of(this.mockProducts.filter((p) => p.category === category));
  }

  searchProducts(query: string): Observable<Product[]> {
    return of(
      this.mockProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()),
      ),
    );
  }
}
