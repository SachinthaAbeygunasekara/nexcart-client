import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent {
  @Input() product: Product = this.getEmptyProduct();
  @Input() isEditing = false;
  @Input() showModal = false;

  @Output() save = new EventEmitter<Product>();
  @Output() cancel = new EventEmitter<void>();

  getEmptyProduct(): Product {
    return {
      id: 0,
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      category: '',
      imageUrl: '',
      status: 'ACTIVE',
    };
  }

  onSubmit(): void {
    this.save.emit(this.product);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
