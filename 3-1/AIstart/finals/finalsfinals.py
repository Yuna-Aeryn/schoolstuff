import numpy as np

# Activation functions
def sigmoid(x):
    return 1 / (1 + np.exp(-x))
def sigmoid_derivative(x):
    return x * (1 - x)

# 5x5 representations of Korean letters (approximate)
patterns = {
    'ㄱ': [
        1,1,1,0,0,
        0,0,1,0,0,
        0,0,1,0,0,
        0,0,1,0,0,
        0,0,1,0,0
    ],
    'ㄴ': [
        1,0,0,0,0,
        1,0,0,0,0,
        1,0,0,0,0,
        1,0,0,0,0,
        1,1,1,1,1
    ],
    'ㄷ': [
        1,1,1,1,0,
        1,0,0,0,1,
        1,0,0,0,0,
        1,0,0,0,1,
        1,1,1,1,0
    ],
    'ㄹ': [
        1,1,1,1,0,
        1,0,0,0,0,
        1,1,1,0,0,
        1,0,0,0,0,
        1,1,1,1,0
    ],
    'ㅁ': [
        1,1,1,1,1,
        1,0,0,0,1,
        1,0,1,0,1,
        1,0,0,0,1,
        1,1,1,1,1
    ],
    'ㅂ': [
        1,1,1,1,1,
        1,0,1,0,1,
        1,1,1,1,1,
        1,0,1,0,1,
        1,1,1,1,1
    ],
    'ㅅ': [
        0,0,1,0,0,
        0,1,0,1,0,
        1,0,0,0,1,
        0,0,0,0,0,
        0,0,0,0,0
    ],
    'ㅇ': [
        0,1,1,1,0,
        1,0,0,0,1,
        1,0,0,0,1,
        1,0,0,0,1,
        0,1,1,1,0
    ],
    'ㅈ': [
        0,1,1,1,0,
        0,0,1,0,0,
        0,1,1,1,0,
        0,0,1,0,0,
        0,0,1,0,0
    ]
}

# Inputs (X) and one-hot outputs (y)
X = np.array([patterns[k] for k in patterns.keys()])
y = np.eye(len(patterns))  # 9 classes → 9 output neurons

# Initialize weights and biases
np.random.seed(42)
input_size = 25
hidden_size = 12
output_size = 9
learning_rate = 0.2
epochs = 10000

W1 = np.random.randn(input_size, hidden_size)
b1 = np.zeros((1, hidden_size))
W2 = np.random.randn(hidden_size, output_size)
b2 = np.zeros((1, output_size))

# Training loop
for epoch in range(epochs):
    # Forward
    z1 = X @ W1 + b1
    a1 = sigmoid(z1)
    z2 = a1 @ W2 + b2
    output = sigmoid(z2)

    # Backward
    error = y - output
    d_output = error * sigmoid_derivative(output)
    d_hidden = (d_output @ W2.T) * sigmoid_derivative(a1)

    # Update weights
    W2 += a1.T @ d_output * learning_rate
    b2 += np.sum(d_output, axis=0, keepdims=True) * learning_rate
    W1 += X.T @ d_hidden * learning_rate
    b1 += np.sum(d_hidden, axis=0, keepdims=True) * learning_rate

    # Log loss
    if epoch % 1000 == 0:
        loss = np.mean(np.square(error))
        print(f"Epoch {epoch}, Loss: {loss:.4f}")

# Prediction function
def predict(pattern):
    pattern = np.array(pattern).reshape(1, -1)
    a1 = sigmoid(pattern @ W1 + b1)
    output = sigmoid(a1 @ W2 + b2)
    return output

# Test
for i, (label, pattern) in enumerate(patterns.items()):
    pred = predict(pattern)
    pred_label = np.argmax(pred)
    print(f"Input: {label}, Prediction index: {pred_label}, Confidence: {np.max(pred):.2f}")
