import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

app = FastAPI(title="Cognify Cognitive Architecture")

# Allow open development access across multiple internal local ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Mock Matrix Database
QUESTION_POOL = [
    {"id": 101, "text": "What is 1/2 + 1/4?", "choices": ["3/4", "2/4", "1/6", "2/3"], "correct": "3/4", "difficulty": 0.2},
    {"id": 102, "text": "Simplify 8/12 to its lowest terms.", "choices": ["2/3", "4/6", "3/4", "1/2"], "correct": "2/3", "difficulty": 0.4},
    {"id": 103, "text": "Divide 3/4 by 2/3.", "choices": ["9/8", "6/12", "5/7", "1/2"], "correct": "9/8", "difficulty": 0.65},
    {"id": 104, "text": "Solve for x: (2/3)x - 1/4 = 5/12", "choices": ["1", "1/2", "3/4", "2"], "correct": "1", "difficulty": 0.85}
]

# Track baseline ability globally
USER_CURRENT_ABILITY = 0.35

class TrackSubmission(BaseModel):
    question_id: int
    selected_answer: str
    profile: str

@app.get("/", response_class=HTMLResponse)
def serve_homepage():
    """Serves the index.html file seamlessly on the root server domain."""
    html_path = os.path.join(os.path.dirname(__file__), "index.html")
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as file:
            return file.read()
    return "<h3>Error: index.html file not found in directory.</h3>"

@app.get("/api/next-question")
def serve_adaptive_item(profile: str = Query("standard")):
    global USER_CURRENT_ABILITY
    
    # Sort closest mathematical distance to our calculated cognitive score
    matched_pool = sorted(QUESTION_POOL, key=lambda q: abs(q["difficulty"] - USER_CURRENT_ABILITY))
    target_item = matched_pool[0]
    
    return {
        "id": target_item["id"],
        "text": target_item["text"],
        "choices": target_item["choices"],
        "difficulty": target_item["difficulty"],
        "user_current_ability": USER_CURRENT_ABILITY
    }

@app.post("/api/evaluate")
def analyze_track_result(submission: TrackSubmission):
    global USER_CURRENT_ABILITY
    
    active_question = next((item for item in QUESTION_POOL if item["id"] == submission.question_id), None)
    if not active_question:
        return {"error": "Item mismatch exception identifier flags."}

    is_correct = (submission.selected_answer == active_question["correct"])
    
    # Set step sizes based on cognitive track variants
    learning_rate = 0.25 if submission.profile == "adhd" else 0.18
        
    if is_correct:
        growth_bonus = max(0.05, active_question["difficulty"] - USER_CURRENT_ABILITY)
        USER_CURRENT_ABILITY = min(1.0, USER_CURRENT_ABILITY + (learning_rate * (1 + growth_bonus)))
    else:
        decay_penalty = max(0.05, USER_CURRENT_ABILITY - active_question["difficulty"])
        USER_CURRENT_ABILITY = max(0.1, USER_CURRENT_ABILITY - (learning_rate * (1 + decay_penalty)))

    return {
        "correct": is_correct,
        "next_estimated_ability": USER_CURRENT_ABILITY
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
