#!/usr/bin/env bash

STATE_MACHINE_GENERATOR_FOLDER=$(readlink -f $(dirname $(readlink -f "$0"))/..)
STATE_MACHINE_JAVA_FOLDER=$(readlink -f $(dirname $(readlink -f "$0"))/../../state-machine-java)

cp -r $STATE_MACHINE_JAVA_FOLDER/src/main/java/com/ciplogic/statemachine/* $STATE_MACHINE_GENERATOR_FOLDER/src/templates/java/

