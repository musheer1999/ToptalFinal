import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, EmptyState, Banner, QtyStepper, fmtMoney } from '../../../components/ui';
import { PageShell, PageHeader } from '../_shared';
import useBrowseMeals from './useBrowseMeals';
import useBrowseMealsQuery from './useBrowseMealsQuery';

const MEAL_TYPE_COLORS = {
  Breakfast: { bg: '#FEF3C7', text: '#92400E' },
  Lunch: { bg: '#DCFCE7', text: '#166534' },
  Dinner: { bg: '#E0E7FF', text: '#3730A3' },
  Appetizer: { bg: '#FCE7F3', text: '#9D174D' },
  Dessert: { bg: '#FBCFE8', text: '#831843' },
  Drink: { bg: '#CFFAFE', text: '#155E75' },
  Main: { bg: '#FFF1EC', text: '#C2410C' },
};

function MealCard({ meal, cart, addMealToCart, updateCartQty, removeFromCart }) {
  const colors = MEAL_TYPE_COLORS[meal.type] || MEAL_TYPE_COLORS.Main;
  const cartItem = cart.items?.find((item) => String(item.mealId) === String(meal.id));
  const inCart = Boolean(cartItem);

  const handleQtyChange = (newQty) => {
    if (newQty === 0) removeFromCart(meal.id);
    else updateCartQty(meal.id, newQty);
  };

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #EDF0F5',
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
      }}
    >
      <div
        style={{
          height: 160,
          background: '#FFF1EC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
          position: 'relative',
        }}
      >
        🍽️
        {meal.type && (
          <span
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              background: colors.bg,
              color: colors.text,
              padding: '3px 8px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.3,
            }}
          >
            {meal.type}
          </span>
        )}
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 8,
            alignItems: 'flex-start',
            marginBottom: 4,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A202C', flex: 1 }}>
            {meal.name}
          </h3>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#FF6B35', whiteSpace: 'nowrap' }}>
            {fmtMoney(parseFloat(meal.price))}
          </span>
        </div>
        <p
          style={{
            margin: '0 0 12px',
            fontSize: 13,
            color: '#718096',
            lineHeight: 1.5,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {meal.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {inCart ? (
            <QtyStepper value={cartItem.qty} onChange={handleQtyChange} min={0} />
          ) : (
            <Button size="sm" onClick={() => addMealToCart(meal)}>
              Add to cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function BrowseMealsPage() {
  const { restaurantId } = useParams();
  const {
    cart,
    restaurant,
    loading,
    setLoading,
    typeFilter,
    setTypeFilter,
    types,
    filteredMeals,
    onAfterLoad,
    addMealToCart,
    updateCartQty,
    removeFromCart,
  } = useBrowseMeals();
  const { loadRestaurantMenu } = useBrowseMealsQuery({ onAfterLoad });

  useEffect(() => {
    setLoading(true);
    loadRestaurantMenu(restaurantId)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loadRestaurantMenu, restaurantId, setLoading]);

  if (loading)
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: 80, color: '#718096' }}>Loading menu...</div>
      </PageShell>
    );

  return (
    <PageShell>
      <PageHeader
        back={{ to: '/browse-restaurants', label: 'Back to restaurants' }}
        title={restaurant ? `${restaurant.name}` : 'Menu'}
        subtitle={restaurant?.description}
      />

      {cart.restaurantId && cart.restaurantId !== String(restaurantId) && (
        <div style={{ marginBottom: 12 }}>
          <Banner tone="warning">
            Your cart has items from another restaurant. Adding here will replace them.
          </Banner>
        </div>
      )}

      <div
        style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}
      >
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              border: '1px solid',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              borderColor: typeFilter === type ? '#1A202C' : '#E2E8F0',
              background: typeFilter === type ? '#1A202C' : 'white',
              color: typeFilter === type ? 'white' : '#4A5568',
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {filteredMeals.length === 0 ? (
        <EmptyState icon="🍽️" title="No meals available" body="Check back soon!" />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {filteredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              cart={cart}
              addMealToCart={addMealToCart}
              updateCartQty={updateCartQty}
              removeFromCart={removeFromCart}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
