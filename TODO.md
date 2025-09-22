# Comandas Component Modification Plan

## Current Status: In Progress

### ✅ Completed:
- [x] Analysis of current comandas component structure
- [x] Plan creation and user approval
- [x] Modify comandas.jsx data structure (replaced cliente with nombrePedido, items with productos array)
- [x] Update UI to display products with quantity and price
- [x] Add "Ver Detalles" button functionality
- [x] Create DetalleComanda.jsx component for order details view
- [x] Update Dashboard.jsx routing for order details
- [x] Add CSS styling for new "Ver Detalles" button

### 🔄 In Progress:
- [ ] Test functionality and navigation

### 📋 Remaining Tasks:
- [ ] Fix modal functions (agregarItem, eliminarItem, etc.) - currently missing
- [ ] Update form to work with new data structure
- [ ] Test the complete flow from comandas list to details view

## Data Structure Changes:
- ✅ Replace `cliente` with `nombrePedido` (order name)
- ✅ Change `items` to `productos` (array of objects with nombre, cantidad, precio)
- ✅ Keep essential fields: mesa, total, estado

## New Components Created:
- ✅ DetalleComanda.jsx - Separate view for order details
- ✅ Updated routing in Dashboard.jsx

## Issues Found:
- The modal functions (agregarItem, eliminarItem, calcularTotal, etc.) are referenced but not defined
- The form still uses the old data structure
- Need to implement the modal functionality to work with the new product structure
