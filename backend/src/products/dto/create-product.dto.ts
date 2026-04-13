import { IsString, IsEnum, IsNumber, IsArray, Min, MinLength } from 'class-validator';
import { ProductCategory, ProductCondition } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsString()
  caliber: string;

  @IsString()
  serialNumber: string;

  @IsEnum(ProductCondition)
  condition: ProductCondition;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @MinLength(20)
  description: string;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsString()
  city: string;

  @IsString()
  province: string;

  @IsString()
  postalCode?: string;
}