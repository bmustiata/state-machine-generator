#!/usr/bin/env bash

STATE_MACHINE_GENERATOR_FOLDER=$(readlink -f $(dirname $(readlink -f "$0"))/..)

STATE_MACHINE_JAVA_FOLDER=$(readlink -f $(dirname $(readlink -f "$0"))/../../state-machine-java)
rm -fr $STATE_MACHINE_GENERATOR_FOLDER/src/templates/java/
mkdir -p $STATE_MACHINE_GENERATOR_FOLDER/src/templates/java/
cp -r $STATE_MACHINE_JAVA_FOLDER/src/main/java/com/ciplogic/statemachine/* $STATE_MACHINE_GENERATOR_FOLDER/src/templates/java/

STATE_MACHINE_JAVA_TS=$(readlink -f $(dirname $(readlink -f "$0"))/../../state-machine-ts)
rm -fr $STATE_MACHINE_GENERATOR_FOLDER/src/templates/ts/
mkdir -p $STATE_MACHINE_GENERATOR_FOLDER/src/templates/ts/
cp -r $STATE_MACHINE_JAVA_TS/src/sm/* $STATE_MACHINE_GENERATOR_FOLDER/src/templates/ts/

