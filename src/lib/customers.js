import customersData from "../../public/json/customers.json";

function formatCustomerFallback(customerId) {
    return customerId
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function getCustomerWebsite(link) {
    if (typeof link !== "string" || link.trim() === "") return null;

    try {
        const url = new URL(link);
        return url.protocol === "http:" || url.protocol === "https:"
            ? link.trim()
            : null;
    } catch {
        return null;
    }
}

function getCustomerProfile(customerId) {
    if (typeof customerId !== "string" || customerId.trim() === "") return null;

    const customer = customersData[customerId];

    return {
        name: customer?.name?.trim() || formatCustomerFallback(customerId),
        link: getCustomerWebsite(customer?.link),
    };
}

export { getCustomerProfile };
