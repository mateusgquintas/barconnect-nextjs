import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { Dashboard } from '../components/Dashboard';
import { LoginScreen } from '../components/LoginScreen';
import { NewComandaDialog } from '../components/NewComandaDialog';

describe('Dashboard', () => {
    const mockProducts = [
        { id: 1, name: 'Product 1', price: 10 },
        { id: 2, name: 'Product 2', price: 20 },
        { id: 3, name: 'Product 3', price: 30 },
    ];

    test('renders Dashboard with products', () => {
        const { container } = render(
            <Provider store={store}>
                <Dashboard products={mockProducts} />
            </Provider>
        );
        const containerElement = container.firstChild;
        expect(containerElement).toBeTruthy();
    });

    test('renders product names', () => {
        const { container } = render(
            <Provider store={store}>
                <Dashboard products={mockProducts} />
            </Provider>
        );
        const productNames = container.querySelectorAll('.product-name');
        expect(productNames.length).toBe(mockProducts.length);
    });
});

describe('LoginScreen', () => {
    const mockLoginFunction = jest.fn();

    test('renders LoginScreen', () => {
        const { container } = render(
            <Provider store={store}>
                <LoginScreen onLogin={mockLoginFunction} />
            </Provider>
        );
        const containerElement = container.firstChild;
        expect(containerElement).toBeTruthy();
    });

    test('calls onLogin when login is submitted', () => {
        const { container } = render(
            <Provider store={store}>
                <LoginScreen onLogin={mockLoginFunction} />
            </Provider>
        );
        const form = container.querySelector('form');
        const submitButton = container.querySelector('button');
        submitButton.dispatchEvent(new Event('submit'));
        expect(mockLoginFunction).toHaveBeenCalledWith('test@example.com', 'password');
    });
});

describe('NewComandaDialog', () => {
    const mockSubmitFunction = jest.fn();

    test('renders NewComandaDialog', () => {
        const { container } = render(
            <Provider store={store}>
                <NewComandaDialog onSubmit={mockSubmitFunction} />
            </Provider>
        );
        const containerElement = container.firstChild;
        expect(containerElement).toBeTruthy();
    });

    test('calls onSubmit when form is submitted', () => {
        const { container } = render(
            <Provider store={store}>
                <NewComandaDialog onSubmit={mockSubmitFunction} />
            </Provider>
        );
        const form = container.querySelector('form');
        const submitButton = container.querySelector('button');
        submitButton.dispatchEvent(new Event('submit'));
        expect(mockSubmitFunction).toHaveBeenCalledWith('test@example.com', 'password');
    });
});