namespace ProductManagement.Application.DTOs;

public record ProductDto(
    Guid Id,
    string Name,
    string Description,
    decimal Price,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CreateProductRequest(
    string Name,
    string Description,
    decimal Price
);

public record UpdateProductRequest(
    string Name,
    string Description,
    decimal Price
);