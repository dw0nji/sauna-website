## Stripe integration task

### Objective
Implement this Stripe integration using the blueprint below. The blueprint describes the required API operations, parameters, and sequencing. Adapt the implementation to your architecture, data models, and tech stack.

### How to use the resources
- Treat the blueprint as the source of truth for required API operations and parameters.
- Prefer reusing outputs from earlier steps as inputs to later ones (e.g., use the created customer ID when creating a subscription).
- Persist and retrieve required Stripe resource identifiers in your datastore (e.g., customer_id, subscription_id) and associate them with existing domain models.
- Do NOT use chapter numbers as names in your code. Name all functions, routes, CLI commands, variables, and files after the domain action they perform (e.g., `create_account`, `/create-checkout-session`, `onboard`) rather than the step they came from (e.g., avoid `chapter1`, `step2`, `/chapter1/create-account`).
- Template variables like ${node...} represent outputs from earlier steps that should be used as inputs to later ones. For example, ${node.createProduct.createProductRequest:default_price} refers to the default_price field from the response of the createProductRequest fixture within the createProduct node.
- If connected to the Stripe MCP server, use tool calls as much as possible to create dependent resources (such as products and prices) if they don't exist already.
- Do not guess as to what the required Stripe API version should be. Leave the API version argument empty when initializing the Stripe client unless the blueprint specifies otherwise.
- When populating .env files or constructing commands for the CLI, use environment variable placeholders for API keys (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY) and instruct the user to obtain them from the Stripe Dashboard.

---

### Resources

#### Blueprints (authoritative "what to call")
<blueprints-json>
[
  {
    "title": "Accept a one-time payment with Checkout",
    "steps": [
      {
        "key": "setup-chapter",
        "title": "Set up product and pricing",
        "description": "Create a product with pricing information for the one-time payment.",
        "nodes": [
          {
            "type": "apiRequests",
            "key": "create-product",
            "title": "Create product and price",
            "description": "Create a product with pricing information.",
            "requests": [
              {
                "key": "create-product-request",
                "path": "/v1/products",
                "method": "post",
                "params": {
                  "name": "Example Product",
                  "default_price_data": {
                    "currency": "usd",
                    "unit_amount": 2000
                  }
                }
              }
            ]
          }
        ]
      },
      {
        "key": "checkout-chapter",
        "title": "Complete checkout",
        "description": "Create a Checkout Session and complete the payment flow.",
        "nodes": [
          {
            "type": "apiRequests",
            "key": "create-checkout-session",
            "title": "Create Checkout Session",
            "description": "Create a Checkout Session for a one-time payment.",
            "requests": [
              {
                "key": "create-checkout-session-request",
                "path": "/v1/checkout/sessions",
                "method": "post",
                "params": {
                  "line_items": [
                    {
                      "price": "${node.setup-chapter.create-product.create-product-request:default_price}",
                      "quantity": 1
                    }
                  ],
                  "mode": "payment",
                  "success_url": "https://dashboard.stripe.com/workbench/blueprints/one-time-payment/checkout-chapter?confirmation-redirect=create-checkout-session",
                  "cancel_url": "https://dashboard.stripe.com/workbench/blueprints/one-time-payment/checkout-chapter?confirmation-redirect=create-checkout-session"
                }
              }
            ]
          },
          {
            "type": "uiComponent",
            "key": "complete-checkout",
            "title": "Complete checkout",
            "description": "Open the Checkout Session URL to complete the payment.",
            "link": "${node.checkout-chapter.create-checkout-session.create-checkout-session-request:url}"
          }
        ]
      },
      {
        "key": "webhook-chapter",
        "title": "Handle webhook events",
        "description": "Listen for webhook events to confirm the payment was successful.",
        "nodes": [
          {
            "type": "asyncHandler",
            "key": "handle-checkout-completed",
            "title": "Wait for checkout.session.completed event",
            "events": [
              {
                "eventType": "checkout.session.completed",
                "eventPayloadType": "snapshot"
              }
            ],
            "expectedNumberOfEvents": 1
          }
        ]
      }
    ]
  }
]
</blueprints-json>