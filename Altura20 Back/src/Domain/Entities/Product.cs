using Altura20.Domain.Common;

namespace Altura20.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public decimal Price { get; private set; }
    public int Stock { get; private set; }
    public bool IsActive { get; private set; } = true;

    private Product() { }

    public static Result<Product> Create(string name, string? description, decimal price, int stock)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<Product>("Product name is required.");
        if (price < 0)
            return Result.Failure<Product>("Price cannot be negative.");
        if (stock < 0)
            return Result.Failure<Product>("Stock cannot be negative.");

        return Result.Success(new Product
        {
            Name = name,
            Description = description,
            Price = price,
            Stock = stock
        });
    }

    public Result Update(string name, string? description, decimal price)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure("Product name is required.");
        if (price < 0)
            return Result.Failure("Price cannot be negative.");

        Name = name;
        Description = description;
        Price = price;
        SetUpdatedAt();
        return Result.Success();
    }

    public Result RemoveStock(int quantity)
    {
        if (quantity <= 0)
            return Result.Failure("Quantity must be greater than zero.");
        if (quantity > Stock)
            return Result.Failure($"Insufficient stock. Available: {Stock}, Requested: {quantity}");

        Stock -= quantity;
        SetUpdatedAt();
        return Result.Success();
    }

    public void AddStock(int quantity) { Stock += quantity; SetUpdatedAt(); }

    public void Deactivate() { IsActive = false; SetUpdatedAt(); }
}
