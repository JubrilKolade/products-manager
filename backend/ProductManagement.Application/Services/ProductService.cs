using FluentValidation;
using ProductManagement.Application.DTOs;
using ProductManagement.Domain.Common;
using ProductManagement.Domain.Entities;
using ProductManagement.Domain.Interfaces;

namespace ProductManagement.Application.Services;

public interface IProductService
{
    Task<Result<PagedResult<ProductDto>>> GetAllAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<Result<ProductDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result<ProductDto>> CreateAsync(
        CreateProductRequest request,
        CancellationToken cancellationToken = default);

    Task<Result<ProductDto>> UpdateAsync(
        Guid id,
        UpdateProductRequest request,
        CancellationToken cancellationToken = default);

    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;
    private readonly IValidator<CreateProductRequest> _createValidator;
    private readonly IValidator<UpdateProductRequest> _updateValidator;

    public ProductService(
        IProductRepository repository,
        IValidator<CreateProductRequest> createValidator,
        IValidator<UpdateProductRequest> updateValidator)
    {
        _repository = repository;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<Result<PagedResult<ProductDto>>> GetAllAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        // Clamp pagination values to safe defaults
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var (items, totalCount) = await _repository.GetAllAsync(
            pageNumber, pageSize, cancellationToken);

        var dtos = items.Select(MapToDto).ToList();

        var pagedResult = new PagedResult<ProductDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        return Result<PagedResult<ProductDto>>.Success(pagedResult);
    }

    public async Task<Result<ProductDto>> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var product = await _repository.GetByIdAsync(id, cancellationToken);

        if (product is null)
            return Result<ProductDto>.Failure($"Product with ID '{id}' was not found.");

        return Result<ProductDto>.Success(MapToDto(product));
    }

    public async Task<Result<ProductDto>> CreateAsync(
        CreateProductRequest request,
        CancellationToken cancellationToken = default)
    {
        var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.Select(e => e.ErrorMessage);
            return Result<ProductDto>.Failure(errors);
        }

        var nameExists = await _repository.ExistsByNameAsync(
            request.Name, excludeId: null, cancellationToken);

        if (nameExists)
            return Result<ProductDto>.Failure(
                $"A product with the name '{request.Name}' already exists.");

        var product = Product.Create(request.Name, request.Description, request.Price);

        await _repository.AddAsync(product, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return Result<ProductDto>.Success(MapToDto(product));
    }

    public async Task<Result<ProductDto>> UpdateAsync(
        Guid id,
        UpdateProductRequest request,
        CancellationToken cancellationToken = default)
    {
        var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.Select(e => e.ErrorMessage);
            return Result<ProductDto>.Failure(errors);
        }

        var product = await _repository.GetByIdAsync(id, cancellationToken);
        if (product is null)
            return Result<ProductDto>.Failure($"Product with ID '{id}' was not found.");

        var nameExists = await _repository.ExistsByNameAsync(
            request.Name, excludeId: id, cancellationToken);

        if (nameExists)
            return Result<ProductDto>.Failure(
                $"A product with the name '{request.Name}' already exists.");

        product.Update(request.Name, request.Description, request.Price);
        _repository.Update(product);
        await _repository.SaveChangesAsync(cancellationToken);

        return Result<ProductDto>.Success(MapToDto(product));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _repository.GetByIdAsync(id, cancellationToken);
        if (product is null)
            return Result.Failure($"Product with ID '{id}' was not found.");

        product.SoftDelete();
        _repository.Update(product);
        await _repository.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    private static ProductDto MapToDto(Product p) =>
        new(p.Id, p.Name, p.Description, p.Price, p.CreatedAt, p.UpdatedAt);
}