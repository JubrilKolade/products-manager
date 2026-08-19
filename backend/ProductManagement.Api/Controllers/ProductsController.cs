using Microsoft.AspNetCore.Mvc;
using ProductManagement.Application.DTOs;
using ProductManagement.Application.Services;

namespace ProductManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IProductService productService, ILogger<ProductsController> logger)
    {
        _productService = productService;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves a paginated list of active products.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _productService.GetAllAsync(pageNumber, pageSize, cancellationToken);
        return Ok(result.Value);
    }

    /// <summary>
    /// Retrieves a single active product by its ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _productService.GetByIdAsync(id, cancellationToken);

        if (!result.IsSuccess)
            return NotFound(new ProblemDetails
            {
                Title = "Product Not Found",
                Detail = result.Errors.FirstOrDefault(),
                Status = StatusCodes.Status404NotFound
            });

        return Ok(result.Value);
    }

    /// <summary>
    /// Creates a new product.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        [FromBody] CreateProductRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _productService.CreateAsync(request, cancellationToken);

        if (!result.IsSuccess)
        {
            // Distinguish between validation errors and business-rule conflicts
            var isConflict = result.Errors.Any(e => e.Contains("already exists"));
            if (isConflict)
                return Conflict(new ProblemDetails
                {
                    Title = "Conflict",
                    Detail = result.Errors.FirstOrDefault(),
                    Status = StatusCodes.Status409Conflict
                });

            return BadRequest(new ValidationProblemDetails
            {
                Title = "Validation Failed",
                Detail = "One or more validation errors occurred.",
                Errors = { ["errors"] = result.Errors.ToArray() }
            });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Value!.Id },
            result.Value);
    }

    /// <summary>
    /// Updates an existing product.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateProductRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _productService.UpdateAsync(id, request, cancellationToken);

        if (!result.IsSuccess)
        {
            if (result.Errors.Any(e => e.Contains("was not found")))
                return NotFound(new ProblemDetails
                {
                    Title = "Product Not Found",
                    Detail = result.Errors.FirstOrDefault(),
                    Status = StatusCodes.Status404NotFound
                });

            if (result.Errors.Any(e => e.Contains("already exists")))
                return Conflict(new ProblemDetails
                {
                    Title = "Conflict",
                    Detail = result.Errors.FirstOrDefault(),
                    Status = StatusCodes.Status409Conflict
                });

            return BadRequest(new ValidationProblemDetails
            {
                Title = "Validation Failed",
                Errors = { ["errors"] = result.Errors.ToArray() }
            });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Soft-deletes a product (sets IsDeleted = true).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _productService.DeleteAsync(id, cancellationToken);

        if (!result.IsSuccess)
            return NotFound(new ProblemDetails
            {
                Title = "Product Not Found",
                Detail = result.Errors.FirstOrDefault(),
                Status = StatusCodes.Status404NotFound
            });

        return NoContent();
    }
}