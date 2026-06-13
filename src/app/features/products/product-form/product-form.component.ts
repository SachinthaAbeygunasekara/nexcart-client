import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnInit {
  @Input() product: Product = this.getEmptyProduct();
  @Input() isEditing = false;
  @Input() showModal = false;

  @Output() save = new EventEmitter<Product>();
  @Output() cancel = new EventEmitter<void>();

  categories: Category[] = [];
  selectedCategoryId: number | null = null;

  constructor(private readonly categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // Set selected category based on product
        if (this.product?.category) {
          this.selectedCategoryId = this.product.category.id;
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      },
    });
  }

  getEmptyProduct(): Product {
    return {
      id: 0,
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      category: undefined,
      imageUrl: '',
      status: 'ACTIVE',
    };
  }

  onSubmit(): void {
    // Update the product's category with the selected one
    const selectedCategory = this.categories.find(c => c.id === this.selectedCategoryId);
    if (selectedCategory) {
      this.product.category = selectedCategory;
    }
    this.save.emit(this.product);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
