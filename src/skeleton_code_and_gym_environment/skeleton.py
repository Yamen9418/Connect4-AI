from fastapi import FastAPI
import json
import math
import pprint
import time

import gym
import random
import requests
import numpy as np
import argparse
import sys

from flask import jsonify

from gym_connect_four import ConnectFourEnv

env: ConnectFourEnv = gym.make("ConnectFour-v0")
state = np.zeros((6, 7), dtype=int)
board_state = np.zeros((6, 7), dtype=int)

# SERVER_ADRESS = "http://localhost:8000/"
SERVER_ADRESS = "https://vilde.cs.lth.se/edap01-4inarow/"
# SERVER_ADRESS = "http://127.0.0.1:8000/api-test"
API_KEY = 'nyckel'
STIL_ID = ["mo4718al-s"]  # TODO: fill this list with your stil-id's

SERVER_PLAYER = 's'
HUMAN_PLAYER = 'h'

CRED = '\33[41m'
CGREEN = '\33[42m'
CEND = '\033[0m'
CORANGE = '\33[43m'
CPURPLE = '\33[45m'
CBLUE = '\33[44m'

####################### API #####################

app = FastAPI()

# @app.get("/api-test")
# def hello(name = None):
#
#     if name is None:
#         text = 'Hello!'
#     else:
#         text = 'Hello ' + name + '!'
#
#     return text


@app.get("/state")
def api_state():
    return json.dumps(env.board.tolist())


@app.get('/start')
def api_start():
    # env.reset()
    pprint.pprint(env.board)
    return json.dumps(env.board.tolist())


@app.get('/move1/{col}')
def move2_api(col: int):
    board = make_move(state, col, 1)
    if not is_end(board)[1]:
        return json.dumps(board.tolist())
    return "Is_done" + json.dumps(board.tolist())


@app.get('/move2/{col}')
def move2_api(col: int):
    board = make_move(state, col, -1)
    if not is_end(board)[1]:
        return json.dumps(board.tolist())
    return "Is_done" + json.dumps(board.tolist())


@app.get('/botmove/{depth}')
def bot_move(depth: int):
    action = alpha_beta_pruning(state, depth)
    return json.dumps(action)


####################### API #####################


def call_server(move):
    res = requests.post(SERVER_ADRESS + "move",
                        data={
                            "stil_id": STIL_ID,
                            "move": move,
                            # -1 signals the system to start a new game. any running game is counted as a loss
                            "api_key": API_KEY,
                        })
    # For safety some response checking is done here
    if res.status_code != 200:
        print("Server gave a bad response, error code={}".format(res.status_code))
        exit()
    if not res.json()['status']:
        print("Server returned a bad status. Return message: ")
        print(res.json()['msg'])
        exit()
    return res


def check_stats():
    res = requests.post(SERVER_ADRESS + "stats",
                        data={
                            "stil_id": STIL_ID,
                            "api_key": API_KEY,
                        })

    stats = res.json()
    return stats


"""
You can make your code work against this simple random agent
before playing against the server.
It returns a move 0-6 or -1 if it could not make a move.
To check your code for better performance, change this code to
use your own algorithm for selecting actions too
"""


def opponents_move(env, state):
    env.change_player()  # change to oppoent
    avmoves = env.available_moves()
    # print(avmoves)
    if not avmoves:
        env.change_player()  # change back to student before returning
        return -1

    # TODO: Optional? change this to select actions with your policy too
    # that way you get way more interesting games, and you can see if starting
    # is enough to guarrantee a win
    # action = random.choice(list(avmoves))
    action = alpha_beta_pruning(state * -1, 5)
    state, reward, done, _ = env.step(action)
    if done:
        if reward == 1:  # reward is always in current players view
            reward = -1
    env.change_player()  # change back to student before returning
    return state, reward, done


def evaluation_func(board):
    """
    Connect 4 Rules: http://web.mit.edu/sp.268/www/2010/connectFourSlides.pdf
    1. If there is a winning move, take it.
    2. If your opponent has a winning move, take the move so he can’t take it.
    3. Take the center square over edges and corners.
    4. Take corner squares over edges.
    5. Take edges if they are the only thing available.
    ------
    Threat: A threat is a square that if taken by opponent forms a game-winning group of four
    Useless Threat: A useless threat is a threat that will never be able to be carried out by the opponent.
    ---
    Three types of nodes:
    -1 black can at least draw the game, 1 the game is a win for white, or 0 the game is as yet undecided.
    """

    """
    check the number of possible 4 in rows, horizontal, vertical, diagonal up and diagonal down.
    """
    position_value = 0

    #      board : width = 7, height = 6
    for i in range(env.board_shape[1]):
        for j in range(env.board_shape[0]):
            # horizontally
            try:
                if board[i][j] == board[i + 1][j] == 1:
                    position_value += 10  # 2 in a row
                elif board[i][j] == board[i + 1][j] == -1:
                    position_value -= 10

                if board[i][j] == board[i + 1][j] == board[i + 2][j] == 1:
                    position_value += 100  # 3 in a row
                elif board[i][j] == board[i + 1][j] == board[i + 2][j] == -1:
                    position_value -= 100

                # if board[i][j] == board[i + 1][j] == board[i + 2][j] == board[i + 3][j] == 1:
                #     position_value += 100000  # 4 in a row
                #     # return position_value
                # elif board[i][j] == board[i + 1][j] == board[i + 2][j] == board[i + 3][j] == -1:
                #     position_value -= 100000
                    # return position_value

            except IndexError:
                pass

            # vertically
            try:
                if board[i][j] == board[i][j + 1] == 1:
                    position_value += 10
                elif board[i][j] == board[i][j + 1] == -1:
                    position_value -= 10

                if board[i][j] == board[i][j + 1] == board[i][j + 2] == 1:
                    position_value += 100
                elif board[i][j] == board[i][j + 1] == board[i][j + 2] == -1:
                    position_value -= 100

                # if board[i][j] == board[i][j + 1] == board[i][j + 2] == board[i][j + 3] == 1:
                #     position_value += 100000
                #     # return position_value
                # elif board[i][j] == board[i][j + 1] == board[i][j + 2] == board[i][j + 3] == -1:
                #     position_value -= 100000
                    # return position_value
            except IndexError:
                pass

            # positive diagonal
            try:
                if not j + 3 > env.board_shape[0] and board[i][j] == board[i + 1][j + 1] == 1:
                    position_value += 10
                elif not j + 3 > env.board_shape[0] and board[i][j] == board[i + 1][j + 1] == -1:
                    position_value -= 10

                if not j + 3 > env.board_shape[0] and board[i][j] == board[i + 1][j + 1] == board[i + 2][j + 2] == 1:
                    position_value += 100
                elif not j + 3 > env.board_shape[0] and board[i][j] == board[i + 1][j + 1] == board[i + 2][j + 2] == -1:
                    position_value -= 100

                # if not j + 3 > env.board_shape[0] and board[i][j] == board[i + 1][j + 1] == board[i + 2][j + 2] == \
                #         board[i + 3][j + 3] == 1:
                #     position_value += 100000
                #     # return position_value
                # elif not j + 3 > env.board_shape[0] and board[i][j] == board[i + 1][j + 1] == board[i + 2][j + 2] == \
                #         board[i + 3][j + 3] == -1:
                #     position_value -= 100000
                    # return position_value

            except IndexError:
                pass

            # negative diagonal
            try:
                if not j - 3 < 0 and board[i][j] == board[i + 1][j - 1] == 1:
                    position_value += 10
                elif not j - 3 < 0 and board[i][j] == board[i + 1][j - 1] == -1:
                    position_value -= 10

                if not j - 3 < 0 and board[i][j] == board[i + 1][j - 1] == board[i + 2][j - 2] == 1:
                    position_value += 100
                elif not j - 3 < 0 and board[i][j] == board[i + 1][j - 1] == board[i + 2][j - 2] == -1:
                    position_value -= 100

                # if not j - 3 < 0 and board[i][j] == board[i + 1][j - 1] == board[i + 2][j - 2] == board[i + 3][
                #     j - 3] == 1:
                #     position_value += 100000
                #     # return position_value
                # elif not j - 3 < 0 and board[i][j] == board[i + 1][j - 1] == board[i + 2][j - 2] == board[i + 3][
                #     j - 3] == -1:
                #     position_value -= 100000
                    # return position_value
            except IndexError:
                pass

    return position_value


def alpha_beta_pruning(board, depth):
    best_score: float = -math.inf
    alpha = -math.inf
    beta = math.inf

    best_score, best_move = max_value(board, alpha, beta, depth)

    print('best_score = ', best_score, ', best_move = ', best_move)

    return best_move


def max_value(board, alpha, beta, depth):
    v = - math.inf
    evals = []

    reward, is_ended = is_end(board)
    if is_ended:
        return reward * 100000, -1

    if depth == 0:
        return evaluation_func(board), -1

    for move in range(7):
        if not is_filled(board, move):
            temp = make_move(board.copy(), move, 1)
            temp_v, temp_move = min_value(temp.copy(), alpha, beta, depth - 1)
            if v < temp_v:
                v = temp_v
                best_move = move
            evals.append(temp_v)

            if v >= beta:
                # print(v)
                return v, temp_move

            alpha = max(alpha, v)
    if depth == 5 or depth == 4:
        print("max_evals", evals)
    return v, best_move


def min_value(board, alpha, beta, depth):
    v = math.inf
    # evals = []
    reward, is_ended = is_end(board)
    if is_ended:
        return reward * 100000, -1

    if depth == 0:
        return evaluation_func(board), -1

    for move in range(7):
        if not is_filled(board, move):
            temp_board = make_move(board.copy(), move, -1)
            temp_v, temp_move = max_value(
                temp_board.copy(), alpha, beta, depth - 1)
            if v > temp_v:
                v = temp_v
                best_move = move
            # evals.append(temp_v)

            if v <= alpha:
                return v, temp_move
            beta = min(beta, v)
    # if depth == 5 or depth == 4:
    #     print("min ", evals)
    return v, best_move


def is_filled(board, move):
    return np.count_nonzero(board[:, move]) == 6


def make_move(board, move, turn):
    for j in range(5, -1, -1):
        if board[:, move][j] == 0:
            board[:, move][j] = turn
            break
    board_state = board
    return board


def is_end(board):
    # Draw
    if (np.count_nonzero(board) == 42):
        return 0, True
    # Test rows
    for i in range(6):
        for j in range(7 - 3):
            value = sum(board[i][j:j + 4])
            if value == 4:
                return 1, True
            if value == -4:
                return -1, True

    # Test columns on transpose array
    reversed_board = [list(i) for i in zip(*board)]
    for i in range(7):
        for j in range(6 - 3):
            value = sum(reversed_board[i][j:j + 4])
            if value == 4:
                return 1, True
            if value == -4:
                return -1, True

    # Test diagonal
    for i in range(6 - 3):
        for j in range(7 - 3):
            value = 0
            for k in range(4):
                value += board[i + k][j + k]
                if value == 4:
                    return 1, True
                if value == -4:
                    return -1, True

    reversed_board = np.fliplr(board)
    # Test reverse diagonal
    for i in range(6 - 3):
        for j in range(7 - 3):
            value = 0
            for k in range(4):
                value += reversed_board[i + k][j + k]
                if value == 4:
                    return 1, True
                if value == -4:
                    return -1, True
    return 0, False


def student_move(state, depth):
    """
   TODO: Implement your min-max alpha-beta pruning algorithm here.
   Give it whatever input arguments you think are necessary
   (and change where it is called).
   The function should return a move from 0-6
   """
    # return random.choice([0, 1, 2, 3, 4, 5, 6])
    return alpha_beta_pruning(state, depth)

# @app.get("/state")


def play_game(vs_server=False, api_server=False):
    """
   The reward for a game is as follows. You get a
   botaction = random.choice(list(avmoves)) reward from the
   server after each move, but it is 0 while the game is running
   loss = -1
   win = +1
   draw = +0.5
   error = -10 (you get this if you try to play in a full column)
   Currently the player always makes the first move
   """

    # default state
    # state = np.zeros((6, 7), dtype=int)
    # if api_server:
    #   api_state(state)
    #   r = requests.get('http://127.0.0.1:8000/state')
    #   print(r.json())

    # setup new game
    global state
    if vs_server:
        # Start a new game
        # -1 signals the system to start a new game. any running game is counted as a loss
        res = call_server(-1)
        # This should tell you if you or the bot starts
        print(res.json()['msg'])
        botmove = res.json()['botmove']
        state = np.array(res.json()['state'])
    else:
        # reset game to starting state
        env.reset(board=None)
        # determine first player
        student_gets_move = random.choice([True, False])
        if student_gets_move:
            print('You start!')
            print()
        else:
            print('Bot starts!')
            print()

    # Print current gamestate
    print("Current state (1 are student discs, -1 are servers, 0 is empty): ")
    print(state)
    print()

    done = False
    while not done:
        # Select your move"
        print(CPURPLE + "student" + CEND)
        start = time.process_time()
        stmove = student_move(state, 5)
        time_taken = time.process_time() - start
        if time_taken >= 5:
            print(CRED + "Error, the move took more than 5 seconds!!" + CEND)
            print()
        else:
            print(CGREEN + "Time taken = ", time_taken, " seconds" + CEND)
            print()

        # make both student and bot/server moves
        if vs_server:
            # Send your move to server and get response
            res = call_server(stmove)
            print(res.json()['msg'])

            # Extract response values
            result = res.json()['result']
            botmove = res.json()['botmove']
            state = np.array(res.json()['state'])
        else:
            if student_gets_move:
                # Execute your move
                avmoves = env.available_moves()
                if stmove not in avmoves:
                    print("You tied to make an illegal move! You have lost the game.")
                    break
                state, result, done, _ = env.step(stmove)
                print(state)
            student_gets_move = True  # student only skips move first turn if bot starts

            # print or render state here if you like
            # print(state)
            # select and make a move for the opponent, returned reward from students view
            if not done:
                # print(opponents_move(env))
                print()
                print(CBLUE + "opponent" + CEND)
                state, result, done = opponents_move(env, state)

        # Check if the game is over
        if result != 0:
            done = True
            if not vs_server:
                print("Game over. ", end="")
            if result == 1:
                print("You won!")
            elif result == 0.5:
                print("It's a draw!")
            elif result == -1:
                print("You lost!")
            elif result == -10:
                print("You made an illegal move and have lost!")
            else:
                print("Unexpected result result={}".format(result))
            if not vs_server:
                print("Final state (1 are student discs, -1 are servers, 0 is empty): ")
        else:
            print("Current state (1 are student discs, -1 are servers, 0 is empty): ")

        # Print current gamestate
        print(state)
        print()


def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group()
    group.add_argument("-l", "--local", help="Play locally",
                       action="store_true")
    group.add_argument(
        "-o", "--online", help="Play online vs server", action="store_true")
    group.add_argument("-api", "--api", help="Fetch data", action="store_true")
    parser.add_argument(
        "-s", "--stats", help="Show your current online stats", action="store_true")
    args = parser.parse_args()

    # Print usage info if no arguments are given
    if len(sys.argv) == 1:
        parser.print_help(sys.stderr)
        sys.exit(1)

    if args.api:
        play_game(api_server=True)
    if args.local:
        play_game(vs_server=False)
    elif args.online:
        play_game(vs_server=True)

    if args.stats:
        stats = check_stats()
        print(stats)

    # TODO: Run program with "--online" when you are ready to play against the server
    # the results of your games there will be logged
    # you can check your stats bu running the program with "--stats"


if __name__ == "__main__":
    main()
