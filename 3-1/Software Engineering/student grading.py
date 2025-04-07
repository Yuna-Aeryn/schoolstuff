def get_valid_score(prompt):
    while True:
        try:
            score = float(input(prompt))
            if 0 <= score <= 100:
                return score
            else:
                print("Score must be between 0 and 100.")
        except ValueError:
            print("Invalid input. Please enter a number.")

def calculate_average(scores):
    return sum(scores) / len(scores)

def assign_letter_grade(average):
    if average >= 90:
        return 'A'
    elif average >= 80:
        return 'B'
    elif average >= 70:
        return 'C'
    elif average >= 60:
        return 'D'
    else:
        return 'F'

# Main Program
name = input("enter name: ")

# Input three exam scores with validation
scores = []
for i in range(1, 4):
    score = get_valid_score(f"Enter score {i}: ")
    scores.append(score)

# Calculate average and letter grade
average = calculate_average(scores)
letter_grade = assign_letter_grade(average)

# Display results
print("\n--- Student Report ---")
print(f"Name: {name}")
print(f"Average Score: {average:.2f}")
print(f"Letter Grade: {letter_grade}")
