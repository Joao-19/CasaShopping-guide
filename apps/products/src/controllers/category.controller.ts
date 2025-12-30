import { Controller, Get } from "@nestjs/common";
import { CategoryService } from "@/services/category.service";

@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }
}
