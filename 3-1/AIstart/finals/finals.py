import numpy as np

# Sigmoid activation and derivative
def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def sigmoid_derivative(x):
    return x * (1 - x)

# 5x5 binary patterns (flattened to 25-element vectors)
patterns = {
    'plus': [
        0,0,1,0,0,
        0,0,1,0,0,
        1,1,1,1,1,
        0,0,1,0,0,
        0,0,1,0,0
    ],
    'hline': [
        0,0,0,0,0,
        1,1,1,1,1,
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,0
    ],
    'vline': [
        0,1,0,0,0,
        0,1,0,0,0,
        0,1,0,0,0,
        0,1,0,0,0,
        0,1,0,0,0
    ]
}

# Inputs and labels
X = np.array([patterns['plus'], patterns['hline'], patterns['vline']])
y = np.array([
    [1, 0, 0],  # plus
    [0, 1, 0],  # hline
    [0, 0, 1]   # vline
])

# Network architecture
input_size = 25
hidden_size = 10
output_size = 3
learning_rate = 0.1
epochs = 10000

# Initialize weights and biases
np.random.seed(1)
W1 = 2 * np.random.random((input_size, hidden_size)) - 1
b1 = np.zeros((1, hidden_size))
W2 = 2 * np.random.random((hidden_size, output_size)) - 1
b2 = np.zeros((1, output_size))

# Training loop
for epoch in range(epochs):
    # Forward pass
    z1 = np.dot(X, W1) + b1
    a1 = sigmoid(z1)
    z2 = np.dot(a1, W2) + b2
    output = sigmoid(z2)

    # Error
    error = y - output
    if epoch % 1000 == 0:
        loss = np.mean(np.square(error))
        print(f"Epoch {epoch}, Loss: {loss:.4f}")

    # Backpropagation
    d_output = error * sigmoid_derivative(output)
    d_hidden = d_output.dot(W2.T) * sigmoid_derivative(a1)

    # Update weights and biases
    W2 += a1.T.dot(d_output) * learning_rate
    b2 += np.sum(d_output, axis=0, keepdims=True) * learning_rate
    W1 += X.T.dot(d_hidden) * learning_rate
    b1 += np.sum(d_hidden, axis=0, keepdims=True) * learning_rate

# Test
def predict(pattern):
    pattern = np.array(pattern).reshape(1, -1)
    a1 = sigmoid(np.dot(pattern, W1) + b1)
    output = sigmoid(np.dot(a1, W2) + b2)
    return output

# Try predicting on a known pattern
test = patterns['plus']
prediction = predict(test)
print("\nPrediction (plus):", prediction)
print("Class:", np.argmax(prediction))  # should be 0
