using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using ProductManagement.Application.Services;

namespace ProductManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();

        // Registers all validators in this assembly automatically
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}