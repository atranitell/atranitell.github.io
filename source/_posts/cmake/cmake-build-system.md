---
title: CMake Build System
date: 2018/06/21 09:04:28
categories:
 - cmake
tags:
 - cmake
 - compiler
 - linux
---

CMake是一直以来想接触的一个技术，主要是应用太过于广泛。跨平台一直是编程领域孜孜不倦追求的方向，如果一套代码能在各个平台上运行那是最好不过的了。然而，每个平台因为硬件差异，系统差异在编译方式，链接方式上总不太一致。为此，CMake的原则是通过写一套预编译系统，能够完美的在各个平台上编译，并解决各类依赖关系等。长话短说，下面开始正式的CMake学习之旅。

## Introduction
A CMake-based buildsystem is organized as a set of high-level logical targets. Each target corresponds to an executable or library, or is a custom target containing custom commands. Dependencies between the targets are expressed in the buildsystem to determine the build order and the rules for regeneration in response to change.

## Binary Targets
Executables and libraries are defined using the `add_executable()` and `add_library()` commands. The resulting binary files have appropriate prefixes, suffixes and extensions for the platform targeted. Dependencies between binary targets are expressed using the `target_link_libraries()` command:
```cmake
add_library(archive archive.cpp zip.cpp lzma.cpp)
add_executable(zipapp zipapp.cpp)
target_link_libraries(zipapp archive)
```
**archive** is defined as a static library – an archive containing objects compiled from *archive.cpp*, *zip.cpp*, and *lzma.cpp*. **zipapp** is defined as an executable formed by compiling and linking *zipapp.cpp*. When linking the zipapp executable, the *archive* static library is linked in.

## Binary Build Type
By default, the `add_library()` command defines a static library, unless a type is specified. A type may be specified when using the command:
```cmake
add_library(archive SHARED archive.cpp zip.cpp lzma.cpp)
add_library(archive STATIC archive.cpp zip.cpp lzma.cpp)
```
The `BUILD_SHARED_LIBS` variable may be enabled to change the behavior of add_library() to build shared libraries by default.
> If present and true, this will cause all libraries to be built shared unless the library was explicitly added as a static library. This variable is often added to projects as an option() so that each user of a project can decide if they want to build the project using shared or static libraries.

In the context of the buildsystem definition as a whole, it is largely irrelevant whether particular libraries are SHARED or STATIC – the commands, dependency specifications and other APIs work similarly regardless of the library type. The MODULE library type is dissimilar in that it is generally not linked to – it is not used in the right-hand-side of the `target_link_libraries()` command. It is a type which is loaded as a plugin using runtime techniques. If the library does not export any unmanaged symbols (e.g. Windows resource DLL, C++/CLI DLL), it is required that the library not be a SHARED library because CMake expects SHARED libraries to export at least one symbol.

## Object Libraries
object libraries may be linked into other targets:
```cmake
add_library(archive OBJECT archive.cpp zip.cpp lzma.cpp)

add_library(archiveExtras STATIC extras.cpp)
target_link_libraries(archiveExtras PUBLIC archive)

add_executable(test_exe test.cpp)
target_link_libraries(test_exe archive)
```
The link (or archiving) step of those other targets will use the object files from object libraries that are directly linked. Additionally, usage requirements of the object libraries will be honored when compiling sources in those other targets. Furthermore, those usage requirements will propagate transitively to dependents of those other targets.

Object libraries may not be used as the TARGET in a use of the `add_custom_command(TARGET)` command signature. However, the list of objects can be used by `add_custom_command(OUTPUT)` or `file(GENERATE)` by using `$<TARGET_OBJECTS:objlib>`.

# Build Specification and Usage Requirements
The `target_include_directories()`, `target_compile_definitions()` and `target_compile_options()` commands specify the build specifications and the usage requirements of binary targets. The commands populate the `include_directories()`, `compile_definitions()` and `compile_options()` target properties respectively, and/or the `interface_include_directories()`, `interface_compile_definitions()` and `interface_compile_options()` target properties.

Each of the commands has a **PRIVATE**, **PUBLIC** and **INTERFACE** mode. The **PRIVATE** mode populates only the non-INTERFACE_ variant of the target property and the INTERFACE mode populates only the INTERFACE_ variants. The PUBLIC mode populates both variants of the respective target property. Each command may be invoked with multiple uses of each keyword:
```cmake
target_compile_definitions(archive
  PRIVATE BUILDING_WITH_LZMA
  INTERFACE USING_ARCHIVE_LIB
)
```
Note that usage requirements are not designed as a way to make downstreams use particular `COMPILE_OPTIONS` or `COMPILE_DEFINITIONS`etc for convenience only. The contents of the properties must be requirements, not merely recommendations or convenience.

## Target Properties
The contents of the `INCLUDE_DIRECTORIES`, `COMPILE_DEFINITIONS` and `COMPILE_OPTIONS` target properties are used appropriately when compiling the source files of a binary target.

Entries in the `INCLUDE_DIRECTORIES` are added to the compile line with **-I** or **-isystem** prefixes and in the order of appearance in the property value.

Entries in the `COMPILE_DEFINITIONS` are prefixed with **-D** or **/D** and added to the compile line in an unspecified order. The `DEFINE_SYMBOL` target property is also added as a compile definition as a special convenience case for SHARED and MODULE library targets.

Entries in the `COMPILE_OPTIONS` are escaped for the shell and added in the order of appearance in the property value. Several compile options have special separate handling, such as `POSITION_INDEPENDENT_CODE`.

The contents of the `INTERFACE_INCLUDE_DIRECTORIES`, `INTERFACE_COMPILE_DEFINITIONS` and `INTERFACE_COMPILE_OPTIONS` target properties are Usage Requirements – they specify content which consumers must use to correctly compile and link with the target they appear on. For any binary target, the contents of each INTERFACE_ property on each target specified in a `target_link_libraries()` command is consumed:
```cmake
set(srcs archive.cpp zip.cpp)
if (LZMA_FOUND)
  list(APPEND srcs lzma.cpp)
endif()
add_library(archive SHARED ${srcs})
if (LZMA_FOUND)
  # The archive library sources are compiled with -DBUILDING_WITH_LZMA
  target_compile_definitions(archive PRIVATE BUILDING_WITH_LZMA)
endif()
target_compile_definitions(archive INTERFACE USING_ARCHIVE_LIB)

add_executable(consumer)
# Link consumer to archive and consume its usage requirements. The consumer
# executable sources are compiled with -DUSING_ARCHIVE_LIB.
target_link_libraries(consumer archive)
```
Because it is common to require that the source directory and corresponding build directory are added to the `INCLUDE_DIRECTORIES`, the `CMAKE_INCLUDE_CURRENT_DIR` variable can be enabled to conveniently add the corresponding directories to the `INCLUDE_DIRECTORIES` of all targets. The variable `CMAKE_INCLUDE_CURRENT_DIR_IN_INTERFACE` can be enabled to add the corresponding directories to the `INTERFACE_INCLUDE_DIRECTORIES` of all targets. This makes use of targets in multiple different directories convenient through use of the `target_link_libraries()` command.

## Output Artifacts 输出控制
The buildsystem targets created by the `add_library()` and `add_executable()` commands create rules to create binary outputs. The exact output location of the binaries can only be determined at generate-time because it can depend on the build-configuration and the link-language of linked dependencies etc. `TARGET_FILE`, `TARGET_LINKER_FILE` and related expressions can be used to access the name and location of generated binaries. These expressions do not work for OBJECT libraries however, as there is no single file generated by such libraries which is relevant to the expressions.

There are three kinds of output artifacts that may be build by targets as detailed in the following sections. Their classification differs between DLL platforms and non-DLL platforms. All Windows-based systems including Cygwin are DLL platforms.

### Runtime Output Artifacts
A runtime output artifact of a buildsystem target may be:
- The executable file (e.g. .exe) of an executable target created by the `add_executable()` command.
- On DLL platforms: the executable file (e.g. .dll) of a shared library target created by the `add_library()` command with the SHARED option.
The `RUNTIME_OUTPUT_DIRECTORY` and `RUNTIME_OUTPUT_NAME` target properties may be used to control runtime output artifact locations and names in the build tree.

### Library Output Artifacts
A library output artifact of a buildsystem target may be:
- The loadable module file (e.g. .dll or .so) of a module library target created by the `add_library()` command with the **MODULE** option.
- On non-DLL platforms: the shared library file (e.g. .so or .dylib) of a shared shared library target created by the `add_library()` command with the **SHARED** option.
The `LIBRARY_OUTPUT_DIRECTORY` and `LIBRARY_OUTPUT_NAME` target properties may be used to control library output artifact locations and names in the build tree.

### Archive Output Artifacts
An archive output artifact of a buildsystem target may be:
- The static library file (e.g. .lib or .a) of a static library target created by the `add_library()` command with the **STATIC** option.
- On DLL platforms: the import library file (e.g. .lib) of a shared library target created by the `add_library()` command with the **SHARED** option. This file is only guaranteed to exist if the library exports at least one unmanaged symbol.
- On DLL platforms: the import library file (e.g. .lib) of an executable target created by the `add_executable()` command when its **ENABLE_EXPORTS** target property is set.
The `ARCHIVE_OUTPUT_DIRECTORY` and `ARCHIVE_OUTPUT_NAME` target properties may be used to control archive output artifact locations and names in the build tree. 