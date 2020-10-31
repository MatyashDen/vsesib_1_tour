#!/usr/bin/env python3
import argparse
import os
import subprocess
import shutil

def dotslash(exepath):
    if os.name == "posix":
        return "./" + exepath
    else:
        return exepath

def check_solution(solution, singletest):
    result = []

    # paths section
    tests_path = "tests"
    input_file_path = "input.txt"
    output_file_path = "output.txt"
    checker = "check"
    visualizer_resource_path = "js_vis/res.js"

    for test in range(1, 101):
        if singletest >= 0 and test != singletest:
            continue    # want to run one test only, and that's not it
        print("Test %d: " % test, end="", flush=True)

        shutil.copyfile(tests_path + "/%d.in" % test, input_file_path)  # copy input file
        return_code = subprocess.call(solution.split())  # run solution
        if return_code != 0:  # check return code
            result.append(-1)
            continue

        check_ret_code = subprocess.call([dotslash(checker), input_file_path, output_file_path, output_file_path])
        if check_ret_code != 0:
            result.append(-1)
            continue

        # add current answer to result
        with open(output_file_path, "r") as output_file:
            answer = output_file.read()
            result.append(int(answer.splitlines()[0]))
        # write current answer to output file (near input)
        with open(tests_path + "/%d.out" % test, "w") as save_file:
            save_file.write(answer)

        # embed input/output into visualizer
        with open(input_file_path, "r") as input_file:
            inputt = input_file.read();
        with open(visualizer_resource_path, "w") as resource_file:
            resource_file.writelines("input = `\n%s\n`;\n\noutput = `\n%s\n`;" % (inputt, answer))

    return result


# main part of script
parser = argparse.ArgumentParser(description="Runs solution on tests.")
parser.add_argument('solution',
                    help='name of solution to test ("java mysol" for Java; dont forget dot-slash on Linux)',
                    metavar="SOLUTION")
parser.add_argument('-i', '--test',
                    default=-1,
                    type=int,
                    help="run only one test with this number",
                    metavar="TEST")

args = parser.parse_args()
test_results = check_solution(args.solution, args.test)

for i in range(len(test_results)):
    print("%7d " % test_results[i], end = "")
    if (i+1) % 10 == 0:
        print("")   # print ten results per line
print("")
